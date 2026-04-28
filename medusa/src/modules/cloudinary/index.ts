import { ModuleProvider, Modules } from "@medusajs/framework/utils";

import CloudinaryService from "./service";

export default ModuleProvider(Modules.FILE, {
  services: [CloudinaryService],
});
