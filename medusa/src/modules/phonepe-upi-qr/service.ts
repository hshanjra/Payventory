import {
  AbstractPaymentProvider,
  MedusaError,
} from "@medusajs/framework/utils";
import { Logger } from "@medusajs/js-sdk";
import {
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/types";
import PhonepeUpiQrClient, { Options } from "./client";
import { ResponseCode, TxnStatus } from "./types";

type InjectedDependencies = {
  logger: Logger;
};

class PhonepeUpiQrProviderService extends AbstractPaymentProvider {
  static identifier = "phonepe_upi_qr";

  protected logger_: Logger;
  protected options_: Options;
  protected client_: PhonepeUpiQrClient;

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options);
    this.logger_ = container.logger;
    this.options_ = options;
    this.client_ = new PhonepeUpiQrClient(container, options);
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.baseUrl) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "PhonePe UPI QR: Base URL is required",
      );
    }
    if (!options.merchantId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "PhonePe UPI QR: Merchant ID is required",
      );
    }
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    const { data } = input;

    const response = await this.client_.checkPaymentStatus(
      data?.transactionId as string,
    );

    if (response.code !== ResponseCode.SUCCESS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
    }

    return {
      data: data,
    };
  }
  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const { data } = input;

    const response = await this.client_.checkPaymentStatus(
      data?.transactionId as string,
    );

    if (response.code !== ResponseCode.SUCCESS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
    }

    if (response.data.paymentState === TxnStatus.PAYMENT_PENDING) {
      return {
        status: "authorized",
      };
    }

    if (response.data.paymentState === TxnStatus.PAYMENT_SUCCESS) {
      return {
        status: "captured",
      };
    }

    return {
      status: "authorized",
    };
  }
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const { data } = input;

    const response = await this.client_.cancelPayment(
      data?.transactionId as string,
    );

    if (response.code !== ResponseCode.SUCCESS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
    }

    return {
      data,
    };
  }
  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const { amount, data = {} } = input;

    try {
      const payload = {
        storeId: (data.store_id as string) || "",
        terminalId: (data?.terminal_id as string) || "",
        transactionId: data.session_id as string,
        amount: Number(amount) * 100,
        expiresIn: 120,
        merchantOrderId: (data.order_id as string) || "",
      };

      const response = await this.client_.initDynamicUPIQR(payload);

      if (response.code !== ResponseCode.SUCCESS) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
      }

      return {
        id: response.data.transactionId,
        data: response.data,
        status: "authorized",
      };
    } catch (error) {
      throw new Error("Failed to initiate payment");
    }
  }
  deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const { data } = input;

    if (!data?.transactionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Transaction ID is required",
      );
    }

    const response = await this.client_.checkPaymentStatus(
      data.transactionId as string,
    );

    if (response.code !== ResponseCode.SUCCESS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
    }

    switch (response.data.paymentState) {
      case TxnStatus.PAYMENT_SUCCESS:
        return { status: "captured" };
      case TxnStatus.PAYMENT_PENDING:
        return { status: "pending" };
      case TxnStatus.PAYMENT_CANCELLED:
      case TxnStatus.PAYMENT_DECLINED:
      case TxnStatus.PAYMENT_ERROR:
      case TxnStatus.TRANSACTION_NOT_FOUND:
        return { status: "canceled" };
      default:
        return { status: "error" };
    }
  }
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    throw new Error("Method not implemented.");
  }
  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    const { data } = input;

    if (!data?.transactionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Transaction ID is required",
      );
    }

    const response = await this.client_.checkPaymentStatus(
      data.transactionId as string,
    );

    if (response.code !== ResponseCode.SUCCESS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
    }

    return {
      data: response.data,
    };
  }
  updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    throw new Error("Method not implemented.");
  }
  async getWebhookActionAndData(
    data: ProviderWebhookPayload["payload"],
  ): Promise<WebhookActionResult> {
    const { data: body, headers } = data;
    const response = await this.client_.verifyCallback(body, headers);
    if (response.code !== ResponseCode.SUCCESS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, response.message);
    }
    switch (response.data.paymentState) {
      case TxnStatus.PAYMENT_SUCCESS:
        return {
          action: "captured",
          data: {
            session_id: response.data.transactionId,
            amount: response.data.amount,
          },
        };
      case TxnStatus.PAYMENT_PENDING:
        return {
          action: "authorized",
          data: {
            session_id: response.data.transactionId,
            amount: response.data.amount,
          },
        };
      case TxnStatus.PAYMENT_CANCELLED:
      case TxnStatus.PAYMENT_DECLINED:
      case TxnStatus.PAYMENT_ERROR:
      case TxnStatus.TRANSACTION_NOT_FOUND:
        return {
          action: "canceled",
          data: {
            session_id: response.data.transactionId,
            amount: response.data.amount,
          },
        };
      default:
        return {
          action: "failed",
          data: {
            session_id: response.data.transactionId,
            amount: response.data.amount,
          },
        };
    }
  }
}

export default PhonepeUpiQrProviderService;
