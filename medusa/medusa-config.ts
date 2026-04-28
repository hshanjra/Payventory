import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },

  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/cloudinary",
            id: "cloudinary",
            options: {
              cloudName: process.env.CLOUDINARY_CLOUD_NAME,
              apiKey: process.env.CLOUDINARY_API_KEY,
              apiSecret: process.env.CLOUDINARY_API_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/phonepe-upi-qr",
            id: "phonepe_upi_qr",
            options: {
              baseUrl: process.env.PHONEPE_UPI_QR_BASE_URL,
              merchantId: process.env.PHONEPE_UPI_QR_MERCHANT_ID,
              saltKey: process.env.PHONEPE_UPI_QR_SALT_KEY,
              saltIndex: process.env.PHONEPE_UPI_QR_SALT_INDEX,
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/stock-transfer",
    },
  ],
});
