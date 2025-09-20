import { createUploadthing } from "uploadthing/next";
import jwt from "jsonwebtoken";

const f = createUploadthing();

const getUserFromToken = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("\n[SERVER DEBUG] JWT VERIFICATION FAILED!");
    console.error("[SERVER DEBUG] Error Name:", error.name);
    console.error("[SERVER DEBUG] Error Message:", error.message);
    return null;
  }
};

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // --- START OF COMPREHENSIVE DEBUGGING BLOCK ---
      console.log("\n[SERVER DEBUG] --- NEW UPLOAD REQUEST RECEIVED ---");
      console.log("[SERVER DEBUG] Timestamp:", new Date().toISOString());
      console.log("[SERVER DEBUG] Request Method:", req.method);
      console.log("[SERVER DEBUG] Request URL:", req.url);
      console.log("[SERVER DEBUG] Request Headers:", req.headers);

      const user = await getUserFromToken(req);

      if (!user) {
        console.error(
          "[SERVER DEBUG] Middleware FAILED: User is not authorized. Check if token is missing or invalid."
        );
        throw new Error("Unauthorized");
      }

      console.log(
        `[SERVER DEBUG] Middleware SUCCESS: User ${user.id} is authorized.`
      );
      console.log("[SERVER DEBUG] --- PROCEEDING TO UPLOADTHING CORE ---");
      // --- END OF COMPREHENSIVE DEBUGGING BLOCK ---

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "\n[SERVER DEBUG] Upload was successful and onUploadComplete was triggered."
      );
      console.log("Upload complete for user ID:", metadata.userId);
      console.log("File URL: ", file.url);
      return { uploadedBy: metadata.userId };
    }),
};
