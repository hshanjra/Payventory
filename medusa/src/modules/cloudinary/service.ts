import {
  Logger,
  ProviderGetFileDTO,
  ProviderUploadStreamDTO,
} from "@medusajs/framework/types";
import { AbstractFileProviderService, MedusaError } from "@medusajs/utils";
import { v2, UploadApiOptions } from "cloudinary";
import { ModuleOptions } from "./types";
import {
  ProviderDeleteFileDTO,
  ProviderFileResultDTO,
  ProviderUploadFileDTO,
} from "@medusajs/framework/types";
import { Writable } from "stream";

type InjectedDependencies = {
  logger: Logger;
};

class CloudinaryService extends AbstractFileProviderService {
  static identifier = "cloudinary";

  protected logger_: Logger;
  private options_: ModuleOptions;
  private cloudinary_: typeof v2;

  constructor({ logger }: InjectedDependencies, options: ModuleOptions) {
    super();

    this.logger_ = logger;
    this.options_ = options;
    this.cloudinary_ = v2;
    this.cloudinary_.config({
      cloud_name: this.options_.cloudName,
      api_key: this.options_.apiKey,
      api_secret: this.options_.apiSecret,
    });
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.cloudName) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cloud name is required in the provider's options.",
      );
    }
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "API key is required in the provider's options.",
      );
    }
    if (!options.apiSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "API secret is required in the provider's options.",
      );
    }
  }

  async upload(
    file: ProviderUploadFileDTO,
    options?: UploadApiOptions,
  ): Promise<ProviderFileResultDTO> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        ...options,
        resource_type: "auto" as const,
      };

      const uploadStream = this.cloudinary_.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error("Upload failed: No result returned"));
          }

          resolve({
            url: result.secure_url,
            key: result.public_id,
          });
        },
      );

      const fileBuffer = Buffer.isBuffer(file.content)
        ? file.content
        : Buffer.from(file.content, "base64");

      uploadStream.end(fileBuffer);
    });
  }

  async delete(file: ProviderDeleteFileDTO): Promise<void> {
    await this.cloudinary_.uploader.destroy(file.fileKey);
  }

  async getUploadStream(fileData: ProviderUploadStreamDTO): Promise<{
    writeStream: Writable;
    promise: Promise<ProviderFileResultDTO>;
    url: string;
    fileKey: string;
  }> {
    const uploadOptions = {
      ...fileData,
      resource_type: "auto" as const,
    };

    let resolvePromise: (value: ProviderFileResultDTO) => void;
    let rejectPromise: (reason?: any) => void;

    const promise = new Promise<ProviderFileResultDTO>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const uploadStream = this.cloudinary_.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return rejectPromise(error);
        }

        if (!result) {
          return rejectPromise(new Error("Upload failed: No result returned"));
        }

        resolvePromise({
          url: result.secure_url,
          key: result.public_id,
        });
      },
    );

    return {
      writeStream: uploadStream,
      promise,
      url: "",
      fileKey: "",
    };
  }

  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
    return this.cloudinary_.url(fileData.fileKey, {
      secure: true,
    });
  }
}

export default CloudinaryService;
