import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface UploadAttachmentProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function UploadAttachment({
  token,
  coordinatorAddr,
  username,
}: UploadAttachmentProps) {
  const [groupName, setGroupName] = useState("");
  const [attachmentKey, setAttachmentKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);

    // Auto-suggest attachment key based on filename
    if (selectedFile && !attachmentKey) {
      setAttachmentKey(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveGroupName = groupName.trim() || username;

    if (!attachmentKey.trim()) {
      setMessage("Please enter an attachment key");
      return;
    }

    if (!file) {
      setMessage("Please select a file to upload");
      return;
    }

    setLoading(true);
    setMessage("");
    setUploadStep("Getting upload URL...");

    try {
      // Step 1: Get presigned upload URL
      const response = await fetch("/api/attachments/upload", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: effectiveGroupName,
          key: attachmentKey,
          content_length: file.size,
          content_type: file.type || "application/octet-stream",
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Step 2: Upload file to presigned URL
        setUploadStep("Uploading file...");
        try {
          const uploadResponse = await fetch(data.url, {
            method: "PUT",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
              "Content-Length": file.size.toString(),
            },
            body: file,
          });

          if (uploadResponse.ok) {
            setMessage(
              `Successfully uploaded "${file.name}" as "${attachmentKey}" to group "${effectiveGroupName}"`,
            );
            setGroupName("");
            setAttachmentKey("");
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById(
              "file",
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";
          } else {
            throw new Error(
              `Failed to upload file: ${uploadResponse.statusText}`,
            );
          }
        } catch (uploadError) {
          setMessage(
            `Failed to upload file: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
          );
        }
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setLoading(false);
      setUploadStep("");
    }
  };

  const handleClear = () => {
    setGroupName("");
    setAttachmentKey("");
    setFile(null);
    setMessage("");
    setUploadStep("");
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upload an Attachment
          </h1>
          <p className="text-gray-600 mb-8">
            Upload a file as an attachment to a specific group. Attachments are
            shared files that can be accessed by group members.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("Successfully")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="groupName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter group name (default: ${username})`}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    The group where the attachment will be stored
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="attachmentKey"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Attachment Key
                  </label>
                  <input
                    type="text"
                    id="attachmentKey"
                    value={attachmentKey}
                    onChange={(e) => setAttachmentKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter unique attachment key"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Unique identifier for this attachment
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  File to Upload
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Select the file you want to upload as an attachment
                  {file && (
                    <span className="ml-2 text-blue-600">
                      Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading || !attachmentKey.trim() || !file}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading
                  ? uploadStep || "Uploading..."
                  : "⬆️ Upload Attachment"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The attachment key should be unique within the group</li>
              <li>
                • File names are automatically suggested as attachment keys
              </li>
              <li>
                • Make sure you have upload permissions for the specified group
              </li>
              <li>• Large files may take longer to upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
