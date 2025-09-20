const { createUploadthing } = require("uploadthing/next");

const f = createUploadthing();

const getUser = async () => ({ id: "fake-user-id" });

const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(() => ({})) // required to avoid "Invalid input" in production
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for file:", file.url);
      return { uploadedBy: "admin" };
    }),
};

module.exports = { ourFileRouter };
