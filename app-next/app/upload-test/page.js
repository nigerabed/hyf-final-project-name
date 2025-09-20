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
    setIsUploading(true);
    setLastUploadedUrl(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const url = `/api/uploadthing?actionType=upload&slug=imageUploader`;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const options = {
        method: "POST",
        body: formData,
        headers: headers,
      };

      // --- START OF COMPREHENSIVE DEBUGGING BLOCK ---
      console.log(
        "%c--- UPLOAD ATTEMPT (CLIENT-SIDE) ---",
        "color: blue; font-weight: bold;"
      );
      console.log("Timestamp:", new Date().toISOString());
      console.log("Request URL:", url);
      console.log("Token exists:", !!token);
      console.log("Request Headers Sent:", options.headers);
      console.log("File being sent:", file);
      // --- END OF COMPREHENSIVE DEBUGGING BLOCK ---

      const response = await fetch(url, options);

      if (!response.ok) {
        // --- START OF DETAILED ERROR LOGGING ---
        console.error(
          "%c--- UPLOAD FAILED (CLIENT-SIDE) ---",
          "color: red; font-weight: bold;"
        );
        console.error("Response Status:", response.status);
        console.error("Response Status Text:", response.statusText);
        const errorBodyText = await response.text();
        console.error("Full Response Body from Server:", errorBodyText);
        // --- END OF DETAILED ERROR LOGGING ---

        try {
          const errorJson = JSON.parse(errorBodyText);
          throw new Error(
            errorJson.message ||
              errorJson.error ||
              `Server responded with status ${response.status}`
          );
        } catch {
          throw new Error(
            `Server responded with status ${response.status}. The response body was: ${errorBodyText}`
          );
        }
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
      console.error("Final upload error caught in handler:", error);
    } finally {
      setIsUploading(false);
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
