import { createUploadthing } from "uploadthing/next";
import jwt from "jsonwebtoken";

console.log(
  "[SERVER DEBUG] STAGE A: core.js file is being loaded by the server."
);

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
      console.log(
        "\n[SERVER DEBUG] STAGE B: imageUploader middleware has been triggered by an upload request."
      );

      const user = await getUserFromToken(req);

      if (!user) {
        console.error("[SERVER DEBUG] STAGE B FAILED: User is not authorized.");
        throw new Error("Unauthorized: You must be logged in to upload files.");
      }

      console.log(
        `[SERVER DEBUG] STAGE B SUCCESS: User ${user.id} is authorized.`
      );
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "\n[SERVER DEBUG] STAGE C: onUploadComplete has been triggered."
      );
      console.log("Upload complete for user ID:", metadata.userId);
      console.log("File URL: ", file.url);
      console.log("[SERVER DEBUG] End of successful upload process.\n");
      return { uploadedBy: metadata.userId };
    }),
};
