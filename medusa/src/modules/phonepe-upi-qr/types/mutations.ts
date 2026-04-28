export interface InitQRRequest {
  merchantId: string;
  subMerchantId?: string;
  storeId: string;
  terminalId?: string;
  gstBreakup?: GSTBreakup;
  invoiceDetails?: InvoiceDetails;
  transactionId: string;
  amount: number; // In paise
  expiresIn: number; // In Seconds
  merchantOrderId?: string;
  message?: string;
}

export interface GSTBreakup {
  gst: number;
  cgst: number;
  cess: number;
  sgst: number;
  igst: number;
  gstIncentive: number;
  gstPercentage: number;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string; //Should be of the format 1970-01-01T05:30:00+05:30
  invoiceName: string;
}

export interface BaseResponse {
  success: boolean;
  code: ResponseCode;
  message: string;
}

export enum ResponseCode {
  SUCCESS = "SUCCESS",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  INVALID_TRANSACTION_ID = "INVALID_TRANSACTION_ID",
  PAYMENT_ALREADY_COMPLETED = "PAYMENT_ALREADY_COMPLETED",
}

export enum TxnStatus {
  TRANSACTION_NOT_FOUND = "TRANSACTION_NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  AUTHORIZATION_FAILED = "AUTHORIZATION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_ERROR = "PAYMENT_ERROR",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_CANCELLED = "PAYMENT_CANCELLED",
  PAYMENT_DECLINED = "PAYMENT_DECLINED",
}

export interface InitDQRResponse extends BaseResponse {
  data: {
    merchantId: string;
    transactionId: string;
    qrString: string;
  };
}

export interface CheckPaymentStatusResponse extends BaseResponse {
  data: {
    transactionId: string;
    merchantId: string;
    amount: number;
    paymentState: TxnStatus;
    payResponseCode: string;
  };
}

export interface CancelPaymentResponse extends BaseResponse {
  data: {};
}
