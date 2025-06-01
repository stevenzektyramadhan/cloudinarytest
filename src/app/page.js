"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadWithProgress() {
  const [files, setFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // or "error"

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
    };
  }, [files]);

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    multiple: true,
    maxFiles: 5,
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setUploading(false);
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setUploadedUrls(res.urls);
          setFiles([]);
          showToastMessage("Upload berhasil!", "success");
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            const msg = err.error || "Upload gagal";
            setError(msg);
            showToastMessage(msg, "error");
          } catch {
            setError("Upload gagal");
            showToastMessage("Upload gagal", "error");
          }
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Terjadi kesalahan jaringan");
      showToastMessage("Terjadi kesalahan jaringan", "error");
    };

    xhr.open("POST", "/api/upload", true);
    xhr.send(formData);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-white shadow-xl rounded-2xl border border-gray-200 relative">
      {/* Toast */}
      {showToast && <div className={`absolute top-4 right-4 z-50 px-4 py-2 rounded-md text-white shadow-md transition-all duration-300 ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}>{toastMessage}</div>}

      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition duration-300 ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}>
        <input {...getInputProps()} />
        <p className="text-gray-600 font-medium text-sm">{isDragActive ? "Lepaskan file di sini..." : "Drag & drop atau klik untuk pilih gambar (maks. 5 file)"}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            {files.map((file, idx) => (
              <div key={idx} className="relative rounded-md shadow-sm group">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-24 w-full object-cover rounded-lg ring-1 ring-gray-300" />
                <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md transition">
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">{files.length} file dipilih</p>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-center text-gray-600 flex items-center justify-center gap-2">
            {progress < 100 ? (
              <>Uploading... {progress}%</>
            ) : (
              <>
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </>
            )}
          </p>
        </div>
      )}

      {error && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">{error}</div>}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className={`w-full px-4 py-2 rounded-md text-white font-semibold transition ${uploading || files.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {uploading ? `Uploading... (${progress}%)` : "Upload"}
      </button>

      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Uploaded Images:</h3>
          <div className="grid grid-cols-3 gap-3">
            {uploadedUrls.map((url, i) => (
              <img key={i} src={url} alt="uploaded" className="h-24 w-full object-cover rounded-lg border shadow-sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
