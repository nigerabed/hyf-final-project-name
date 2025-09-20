"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function UploadTestPage() {
  const [lastUploadedUrl, setLastUploadedUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAuthenticatedUpload = async (file) => {
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert(
        "Authentication error. Please log in to the main application first."
      );
      return;
    }

    setIsUploading(true);
    setLastUploadedUrl(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch(
        `/api/uploadthing?actionType=upload&slug=imageUploader`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ error: "Upload failed" }));
        throw new Error(
          errorBody.error || `Server responded with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result && result.length > 0) {
        const imageUrl = result[0].url;
        setLastUploadedUrl(imageUrl);
        alert("Upload Completed! See the preview below.");
      } else {
        throw new Error("Upload completed but no URL was returned.");
      }
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Clear the file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-24 bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          UploadThing Test Page
        </h1>
        <p className="text-gray-600 mt-2">
          This is a standalone page for testing the secure image upload process.
        </p>
      </div>

      <div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleAuthenticatedUpload(e.target.files[0]);
            }
          }}
        />
        <button
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? "Uploading..." : "Upload an Image"}
        </button>
      </div>

      {lastUploadedUrl && (
        <div className="text-center p-6 bg-green-100 border border-green-300 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800">
            Last Upload Successful!
          </h2>
          <p className="text-green-700 mt-2">Image URL:</p>
          <a
            href={lastUploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {lastUploadedUrl}
          </a>
          <div className="mt-4">
            <Image
              src={lastUploadedUrl}
              alt="Uploaded image"
              width={300}
              height={300}
              className="max-w-xs rounded-md shadow-lg mx-auto"
            />
          </div>
        </div>
      )}
    </main>
  );
}
