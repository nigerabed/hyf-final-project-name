import { createUploadthing } from "uploadthing/next";
import jwt from "jsonwebtoken";

const f = createUploadthing();

/**
 * A helper function to extract and verify the JWT from the request headers.
 * This is your security gate.
 * @param {Request} req The incoming request object.
 * @returns The decoded user payload from the token, or null if invalid.
 */
const getUserFromToken = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    // Verify the token using your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    // If token verification fails (expired, invalid, etc.), return null.
    console.error("JWT Verification Error:", error.message);
    return null;
  }
};

// This is your new, robust file router.
export const ourFileRouter = {
  // Define a FileRoute for image uploading.
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // This middleware runs on the server BEFORE every upload.
    // It is the gatekeeper that decides who is allowed to upload.
    .middleware(async ({ req }) => {
      // Get the user from the JWT.
      const user = await getUserFromToken(req);

      // If the user is not authenticated, throw an error.
      // This is the correct way to prevent unauthorized uploads.
      if (!user)
        throw new Error("Unauthorized: You must be logged in to upload files.");

      // The data you return here becomes available in the `onUploadComplete`
      // callback as `metadata`. This is essential for associating the upload
      // with the correct user in your database.
      return { userId: user.id };
    })
    // This code runs on your server AFTER a successful upload.
    .onUploadComplete(async ({ metadata, file }) => {
      // The `metadata` object contains the `userId` you returned from the middleware.
      console.log("Upload complete for user ID:", metadata.userId);
      console.log("File URL: ", file.url);

      // This data is sent back to the client on successful upload.
      // You can use it to update your database.
      return { uploadedBy: metadata.userId };
    }),
};
