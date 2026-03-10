const VTB_OAUTH_URL = process.env.VTB_OAUTH_URL || 'https://epa-ift-sbp.vtb.ru:443/passport/oauth2/token';
const VTB_API_URL = (process.env.VTB_API_URL || 'https://test3.api.vtb.ru:8443/openapi/smb/efcp/e-commerce/v1').replace(/\/$/, '');
const VTB_CLIENT_ID = process.env.VTB_CLIENT_ID;
const VTB_CLIENT_SECRET = process.env.VTB_CLIENT_SECRET;
const VTB_MERCHANT_AUTHORIZATION = process.env.VTB_MERCHANT_AUTHORIZATION;

let cachedToken: { value: string; expiresAt: number } | null = null;

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

  const response = await fetch(VTB_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const text = await response.text();
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
  const response = await fetch(`${VTB_API_URL}${path}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-IBM-Client-Id': getXIbmClientId(),
      'Content-Type': 'application/json',
      ...(VTB_MERCHANT_AUTHORIZATION ? { 'Merchant-Authorization': VTB_MERCHANT_AUTHORIZATION } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const text = await response.text();
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
