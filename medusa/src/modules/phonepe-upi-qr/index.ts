import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import PhonepeUpiQrProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [PhonepeUpiQrProviderService],
});
