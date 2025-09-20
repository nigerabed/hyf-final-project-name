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
    console.error("[SERVER DEBUG] End of JWT error log.\n");
    return null;
  }
};

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // --- START OF NEW DEBUGGING BLOCK ---
      console.log("\n[SERVER DEBUG] --- INCOMING UPLOAD REQUEST ---");
      console.log("[SERVER DEBUG] Request Method:", req.method);
      console.log("[SERVER DEBUG] Request URL:", req.url);
      console.log("[SERVER DEBUG] All Request Headers:", req.headers);
      // --- END OF NEW DEBUGGING BLOCK ---

      const user = await getUserFromToken(req);

      if (!user) {
        console.error(
          "[SERVER DEBUG] Middleware check FAILED: User is not authorized."
        );
        throw new Error("Unauthorized");
      }

      console.log(
        `[SERVER DEBUG] Middleware check SUCCESS: User ${user.id} is authorized.`
      );
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
