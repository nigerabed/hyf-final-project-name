import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// ======================= DEFINITIVE DEBUGGING START =======================
console.log(
  "\n[UploadThing DEBUG] SERVER STARTUP: Checking Environment Variables..."
);
console.log(
  "[UploadThing DEBUG] UPLOADTHING_SECRET is set:",
  !!process.env.UPLOADTHING_SECRET
);
console.log(
  "[UploadThing DEBUG] UPLOADTHING_APP_ID is set:",
  !!process.env.UPLOADTHING_APP_ID
);
console.log(
  "[UploadThing DEBUG] UPLOADTHING_URL value is:",
  process.env.UPLOADTHING_URL
);
console.log(
  "[UploadThing DEBUG] Environment check complete on server startup.\n"
);
// ======================== DEFINITIVE DEBUGGING END ========================

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
