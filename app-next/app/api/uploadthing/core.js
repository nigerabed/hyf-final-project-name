import { createUploadthing } from "uploadthing/next";
import jwt from "jsonwebtoken";

const f = createUploadthing();

/**
 * A helper function to extract and verify the JWT from the request headers.
 * Includes detailed error logging for debugging.
 * @param {Request} req The incoming request object.
 * @returns The decoded user payload from the token, or null if invalid.
 */
const getUserFromToken = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    // ======================= DEBUGGING START =======================
    // This block will catch the specific JWT error and log it.
    console.error("\n[UploadThing DEBUG] JWT VERIFICATION FAILED!");
    console.error("[UploadThing DEBUG] Error Name:", error.name); // e.g., 'TokenExpiredError', 'JsonWebTokenError'
    console.error("[UploadThing DEBUG] Error Message:", error.message); // e.g., 'jwt expired', 'invalid signature'
    console.error("[UploadThing DEBUG] Full Error Object:", error);
    console.error("[UploadThing DEBUG] End of error log.\n");
    // ======================== DEBUGGING END ========================
    return null;
  }
};

// This is your robust file router.
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await getUserFromToken(req);

      if (!user)
        throw new Error("Unauthorized: You must be logged in to upload files.");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user ID:", metadata.userId);
      console.log("File URL: ", file.url);
      return { uploadedBy: metadata.userId };
    }),
};
