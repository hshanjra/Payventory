import { Logger } from "@medusajs/js-sdk";
import {
  CancelPaymentResponse,
  CheckPaymentStatusResponse,
  InitDQRResponse,
  InitQRRequest,
} from "./types";
import crypto, { randomUUID } from "node:crypto";
import { MedusaError } from "@medusajs/framework/utils";

export type Options = {
  baseUrl: string;
  merchantId: string;
  saltKey: string;
  saltIndex: string;
};

type InjectedDependencies = {
  logger: Logger;
};

export default class PhonepeUpiQrClient {
  options_: Options;
  logger_: Logger;

  constructor(container: InjectedDependencies, options: Options) {
    this.options_ = options;
    this.logger_ = container.logger;
  }

  async initDynamicUPIQR(
    request: Omit<InitQRRequest, "merchantId">,
    callback_url?: string,
  ): Promise<InitDQRResponse> {
    // 1. Prepare PhonePe Payload
    const payload = {
      merchantId: this.options_.merchantId,
      ...request,
    };

    // 2. PhonePe Security (X-VERIFY Header)
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64",
    );
    const fullChecksum =
      crypto
        .createHash("sha256")
        .update(base64Payload + "/v3/qr/init" + this.options_.saltKey)
        .digest("hex") +
      "###" +
      this.options_.saltIndex;

    // 3. Return the QR string to the Medusa Session
    try {
      const response = await fetch(`${this.options_.baseUrl}/v3/qr/init`, {
        method: "POST",
        headers: {
          "X-VERIFY": fullChecksum,
          "Content-Type": "application/json",
          ...(callback_url ? { "X-CALLBACK-URL": callback_url } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Error initiating PhonePe Dynamic UPI QR",
        );
      }

      const data = await response.json();
      return data;
    } catch (e) {
      this.logger_.error(e);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Error initiating PhonePe Dynamic UPI QR",
      );
    }
  }

  async checkPaymentStatus(txnId: string): Promise<CheckPaymentStatusResponse> {
    const url = `${this.options_.baseUrl}/v3/transaction/${this.options_.merchantId}/${txnId}/status`;

    const fullChecksum =
      crypto
        .createHash("sha256")
        .update(
          `/v3/transaction/${this.options_.merchantId}/${txnId}/status` +
            this.options_.saltKey,
        )
        .digest("hex") +
      "###" +
      this.options_.saltIndex;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": fullChecksum,
        },
      });
      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Error checking PhonePe Dynamic UPI QR payment status",
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger_.error(error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Error checking PhonePe Dynamic UPI QR payment status",
      );
    }
  }

  async cancelPayment(
    txnId: string,
    callback_url?: string,
  ): Promise<CancelPaymentResponse> {
    const url = `${this.options_.baseUrl}/v3/charge/${this.options_.merchantId}/${txnId}/cancel`;

    const fullChecksum =
      crypto
        .createHash("sha256")
        .update(
          `/v3/charge/${this.options_.merchantId}/${txnId}/cancel` +
            this.options_.saltKey,
        )
        .digest("hex") +
      "###" +
      this.options_.saltIndex;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-VERIFY": fullChecksum,
          "Content-Type": "application/json",
          ...(callback_url ? { "X-CALLBACK-URL": callback_url } : {}),
        },
      });

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Error cancelling PhonePe Dynamic UPI QR payment",
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger_.error(error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Error cancelling PhonePe Dynamic UPI QR payment",
      );
    }
  }

  async verifyCallback(
    body: Record<string, unknown>,
    headers: Record<string, unknown>,
  ) {
    const xVerifyHeader = headers["x-verify"];
    // 1. Verify the Checksum (Crucial for Security)
    const stringToHash = JSON.stringify(body) + this.options_.saltKey;
    const expectedHash =
      crypto.createHash("sha256").update(stringToHash).digest("hex") +
      "###" +
      this.options_.saltIndex;

    if (xVerifyHeader !== expectedHash) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Invalid Signature",
      );
    }

    // 2. Decode the Payload
    const decodedPayload = JSON.parse(
      Buffer.from(JSON.stringify(body), "base64").toString("utf-8"),
    );
    return decodedPayload;
  }

  //TODO: Implement refund payment
  async refundPayment() {}

  // generateUniqueId() {
  //   return `txn_${Date.now()}_${randomUUID().replace(/-/g, "").substring(0, 8)}`;
  // }
}
