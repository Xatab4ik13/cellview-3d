/**
 * VTB RBS Payment Gateway integration
 * Gateway: https://platezh.vtb24.ru/payment/rest/
 * Auth: login + password (no OAuth)
 */

const VTB_RBS_URL = (process.env.VTB_RBS_URL || 'https://platezh.vtb24.ru/payment/rest').replace(/\/$/, '');
const VTB_RBS_LOGIN = process.env.VTB_RBS_LOGIN || '';
const VTB_RBS_PASSWORD = process.env.VTB_RBS_PASSWORD || '';

// ---------- Types ----------

export type RbsOrderStatus = {
  orderNumber: string;
  orderStatus: number; // 0=registered, 1=pre-authorized, 2=deposited, 3=reversed, 4=refunded, 5=declined, 6=declined by ACS
  actionCode: number;
  actionCodeDescription: string;
  amount: number; // kopecks
  currency: string;
  date: number;
  ip: string;
  merchantOrderParams?: Array<{ name: string; value: string }>;
  cardAuthInfo?: {
    pan?: string;
    expiration?: string;
    cardholderName?: string;
    approvalCode?: string;
  };
  paymentAmountInfo?: {
    depositedAmount?: number;
    approvedAmount?: number;
    refundedAmount?: number;
    paymentState?: string;
  };
  bankInfo?: {
    bankName?: string;
    bankCountryCode?: string;
    bankCountryName?: string;
  };
};

export type RbsRegisterResponse = {
  orderId?: string;   // VTB internal order ID
  formUrl?: string;   // redirect URL for payment
  errorCode?: string;
  errorMessage?: string;
};

export type RbsStatusResponse = RbsOrderStatus & {
  errorCode?: string;
  errorMessage?: string;
  OrderStatus?: number;
};

export type RbsRefundResponse = {
  errorCode?: string;
  errorMessage?: string;
};

// ---------- Helpers ----------

async function rbsRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  if (!VTB_RBS_LOGIN || !VTB_RBS_PASSWORD) {
    throw new Error('Не заданы VTB_RBS_LOGIN / VTB_RBS_PASSWORD');
  }

  const body = new URLSearchParams({
    userName: VTB_RBS_LOGIN,
    password: VTB_RBS_PASSWORD,
    ...params,
  });

  const url = `${VTB_RBS_URL}/${endpoint}`;
  console.log(`[VTB-RBS] POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await res.text();
  console.log(`[VTB-RBS] Response ${res.status}: ${text.slice(0, 500)}`);

  if (!res.ok) {
    throw new Error(`VTB RBS error HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(`VTB RBS invalid JSON: ${text.slice(0, 200)}`);
  }

  return data;
}

// ---------- Public API ----------

export async function rbsRegisterOrder(opts: {
  orderNumber: string;
  amount: number; // kopecks
  returnUrl: string;
  failUrl: string;
  description?: string;
  email?: string;
  phone?: string;
  sessionTimeoutSecs?: number;
}): Promise<RbsRegisterResponse> {
  const params: Record<string, string> = {
    orderNumber: opts.orderNumber,
    amount: String(opts.amount),
    returnUrl: opts.returnUrl,
    failUrl: opts.failUrl,
  };
  if (opts.description) params.description = opts.description;
  if (opts.sessionTimeoutSecs) params.sessionTimeoutSecs = String(opts.sessionTimeoutSecs);

  // jsonParams for customer data
  const jsonParams: Record<string, string> = {};
  if (opts.email) jsonParams.email = opts.email;
  if (opts.phone) jsonParams.phone = opts.phone;
  if (Object.keys(jsonParams).length) {
    params.jsonParams = JSON.stringify(jsonParams);
  }

  const result = await rbsRequest<RbsRegisterResponse>('register.do', params);

  if (result.errorCode && result.errorCode !== '0') {
    throw new Error(result.errorMessage || `RBS register error ${result.errorCode}`);
  }

  return result;
}

export async function rbsGetOrderStatus(orderId: string): Promise<RbsStatusResponse> {
  return rbsRequest<RbsStatusResponse>('getOrderStatusExtended.do', { orderId });
}

export async function rbsRefund(orderId: string, amountKopecks: number): Promise<RbsRefundResponse> {
  const result = await rbsRequest<RbsRefundResponse>('refund.do', {
    orderId,
    amount: String(amountKopecks),
  });

  if (result.errorCode && result.errorCode !== '0') {
    throw new Error(result.errorMessage || `RBS refund error ${result.errorCode}`);
  }

  return result;
}

/**
 * Map RBS orderStatus number to our internal status
 * 0=registered, 1=pre-authorized, 2=deposited(paid), 3=reversed, 4=refunded, 5=declined, 6=declined by ACS
 */
export function mapRbsStatus(orderStatus: number | undefined): 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'expired' {
  switch (orderStatus) {
    case 0: return 'created';
    case 1: return 'pending'; // pre-authorized
    case 2: return 'paid';    // deposited
    case 3: return 'failed';  // reversed
    case 4: return 'refunded';
    case 5:
    case 6: return 'failed';  // declined
    default: return 'pending';
  }
}
