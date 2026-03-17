import https from 'node:https';
import fs from 'node:fs';
import { URL } from 'node:url';

const VTB_OAUTH_URL = process.env.VTB_OAUTH_URL || 'https://epa-ift-sbp.vtb.ru:443/passport/oauth2/token';
const VTB_API_URL = (process.env.VTB_API_URL || 'https://test3.api.vtb.ru:8443/openapi/smb/efcp/e-commerce/v1').replace(/\/$/, '');
const VTB_CLIENT_ID = process.env.VTB_CLIENT_ID;
const VTB_CLIENT_SECRET = process.env.VTB_CLIENT_SECRET;
const VTB_MERCHANT_AUTHORIZATION = process.env.VTB_MERCHANT_AUTHORIZATION;

let cachedToken: { value: string; expiresAt: number } | null = null;

// Build custom CA list: system default + Russian Trusted CA bundle
const EXTRA_CA_PATH = process.env.NODE_EXTRA_CA_CERTS || '/etc/ssl/certs/russian-trusted-bundle.pem';
let extraCa: string | undefined;
try {
  extraCa = fs.readFileSync(EXTRA_CA_PATH, 'utf-8');
} catch { /* ignore if file not found */ }

const httpsAgent = new https.Agent({
  ca: extraCa ? [extraCa] : undefined,
  keepAlive: true,
  timeout: 30000,
});

/** Low-level HTTPS request that bypasses undici/fetch issues */
function httpsRequest(
  url: string,
  options: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        agent: httpsAgent,
        timeout: 30000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString() }));
      },
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

type VtbStatus = {
  value?: string;
  description?: string;
  changedAt?: string;
};

type VtbAmount = {
  value: number;
  code: 'RUB';
};

type VtbPaymentObject = {
  paymentId?: string;
  paymentCode?: string;
  orderId?: string;
  orderCode?: string;
  createdAt?: string;
  orderName?: string;
  description?: string;
  amount?: VtbAmount;
  paymentData?: {
    type?: string;
    bindingId?: string | null;
    bindingType?: string | null;
    status?: string | null;
  };
  status?: VtbStatus;
  Status?: VtbStatus;
};

type VtbRefundObject = {
  refundId?: string;
  paymentId?: string;
  paymentCode?: string;
  orderId?: string;
  orderCode?: string;
  createdAt?: string;
  amount?: VtbAmount;
  status?: VtbStatus;
  Status?: VtbStatus;
};

export type VtbOrderResponse = {
  type?: 'ORDER';
  object?: {
    orderId?: string;
    orderCode?: string;
    createdAt?: string;
    expire?: string;
    payUrl?: string;
    amount?: VtbAmount;
    status?: VtbStatus;
    Status?: VtbStatus;
    transactions?: {
      payments?: Array<{ type?: string; object?: VtbPaymentObject }>;
      refunds?: Array<{ type?: string; object?: VtbRefundObject }>;
    };
  };
};

export type VtbPaymentCallback = {
  type?: 'PAYMENT';
  object?: VtbPaymentObject;
};

export type VtbRefundResponse = {
  type?: 'REFUND';
  object?: VtbRefundObject;
};

export type VtbCallbackPayload = VtbPaymentCallback | VtbRefundResponse;

export type CreateMerchantOrderPayload = {
  orderId: string;
  orderName: string;
  expire: string;
  amount: VtbAmount;
  returnUrl: string;
  customer?: {
    customerId?: string;
    email?: string;
    phone?: string;
  };
  additionalInfo?: string;
};

export type CreateMerchantRefundPayload = {
  refundId: string;
  paymentId: string;
  amount: VtbAmount;
};

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function getXIbmClientId(): string {
  if (!VTB_CLIENT_ID) {
    throw new Error('Не задан VTB_CLIENT_ID');
  }

  return VTB_CLIENT_ID.split('@')[0].trim().toLowerCase();
}

async function getAccessToken(): Promise<string> {
  if (!VTB_CLIENT_ID || !VTB_CLIENT_SECRET) {
    throw new Error('Не заданы VTB_CLIENT_ID и VTB_CLIENT_SECRET');
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: VTB_CLIENT_ID,
    client_secret: VTB_CLIENT_SECRET,
  });

  console.log(`[VTB] OAuth request to ${VTB_OAUTH_URL}`);
  console.log(`[VTB] NODE_EXTRA_CA_CERTS=${process.env.NODE_EXTRA_CA_CERTS || '(not set)'}`);
  console.log(`[VTB] NODE_TLS_REJECT_UNAUTHORIZED=${process.env.NODE_TLS_REJECT_UNAUTHORIZED || '(not set)'}`);

  let response: globalThis.Response;
  try {
    response = await fetch(VTB_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
  } catch (fetchErr: any) {
    console.error(`[VTB] OAuth fetch FAILED:`, fetchErr?.cause || fetchErr?.message || fetchErr);
    throw new Error(`VTB OAuth fetch failed: ${fetchErr?.cause?.code || fetchErr?.message || 'unknown'}`);
  }

  const text = await response.text();
  console.log(`[VTB] OAuth response ${response.status}: ${text.slice(0, 300)}`);
  const data = parseJson<{ access_token?: string; expires_in?: number; error_description?: string }>(text);

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || `Не удалось получить access_token ВТБ (HTTP ${response.status})`);
  }

  const ttlSeconds = Math.max(Number(data.expires_in || 179) - 10, 30);
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };

  return cachedToken.value;
}

async function merchantApiRequest<T>(path: string, init: { method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<T> {
  const accessToken = await getAccessToken();
  const url = `${VTB_API_URL}${path}`;
  console.log(`[VTB] API ${init.method || 'GET'} ${url}`);

  let response: globalThis.Response;
  try {
    response = await fetch(url, {
      method: init.method || 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-IBM-Client-Id': getXIbmClientId(),
        'Content-Type': 'application/json',
        ...(VTB_MERCHANT_AUTHORIZATION ? { 'Merchant-Authorization': VTB_MERCHANT_AUTHORIZATION } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch (fetchErr: any) {
    console.error(`[VTB] API fetch FAILED:`, fetchErr?.cause || fetchErr?.message || fetchErr);
    throw new Error(`VTB API fetch failed: ${fetchErr?.cause?.code || fetchErr?.message || 'unknown'}`);
  }

  const text = await response.text();
  console.log(`[VTB] API response ${response.status}: ${text.slice(0, 500)}`);
  const data = parseJson<T>(text);

  if (!response.ok || !data) {
    throw new Error(text || `Ошибка запроса к VTB Merchant API (HTTP ${response.status})`);
  }

  return data;
}

export function getVtbStatusValue(entity: { status?: VtbStatus; Status?: VtbStatus } | null | undefined): string | null {
  const status = entity?.status || entity?.Status;
  return status?.value ? String(status.value).toUpperCase() : null;
}

export function getVtbStatusChangedAt(entity: { status?: VtbStatus; Status?: VtbStatus } | null | undefined): string | null {
  const status = entity?.status || entity?.Status;
  return status?.changedAt || null;
}

export function getOrderPaymentObject(order: VtbOrderResponse | null | undefined): VtbPaymentObject | null {
  return order?.object?.transactions?.payments?.[0]?.object || null;
}

export async function createMerchantOrder(payload: CreateMerchantOrderPayload): Promise<VtbOrderResponse> {
  return merchantApiRequest<VtbOrderResponse>('/orders', {
    method: 'POST',
    body: payload,
  });
}

export async function getMerchantOrder(orderId: string): Promise<VtbOrderResponse> {
  return merchantApiRequest<VtbOrderResponse>(`/orders/${encodeURIComponent(orderId)}`);
}

export async function createMerchantRefund(payload: CreateMerchantRefundPayload): Promise<VtbRefundResponse> {
  return merchantApiRequest<VtbRefundResponse>('/refunds', {
    method: 'POST',
    body: payload,
  });
}
