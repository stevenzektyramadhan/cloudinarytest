import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return Response.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Validasi file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    if (files.length > maxFiles) {
      return Response.json({ error: `Maximum ${maxFiles} files allowed` }, { status: 400 });
    }

    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type) || file.size > maxSize);

    if (invalidFiles.length > 0) {
      const errors = invalidFiles.map((file) => {
        if (!allowedTypes.includes(file.type)) {
          return `${file.name}: Invalid file type`;
        }
        if (file.size > maxSize) {
          return `${file.name}: File too large (max 5MB)`;
        }
      });

      return Response.json({ error: errors.join(", ") }, { status: 400 });
    }

    // Fungsi upload dengan error handling
    const uploadSingleFile = async (file) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "latihan1",
              resource_type: "image",
              transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
            },
            (error, result) => {
              if (error) {
                console.error(`Error uploading ${file.name}:`, error);
                reject(new Error(`Failed to upload ${file.name}`));
              } else {
                resolve(result.secure_url);
              }
            }
          );

          bufferStream.pipe(stream);
        });
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
        throw new Error(`Failed to process ${file.name}`);
      }
    };

    // Upload dengan batasan concurrency
    const concurrency = 3; // Upload 3 file sekaligus
    const batches = [];
    for (let i = 0; i < files.length; i += concurrency) {
      batches.push(files.slice(i, i + concurrency));
    }

    const urls = [];
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(batch.map(uploadSingleFile));

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          urls.push(result.value);
        } else {
          console.error(result.reason);
          // Lanjutkan upload file lain meskipun ada yang gagal
        }
      }
    }

    if (urls.length === 0) {
      return Response.json({ error: "All files failed to upload" }, { status: 500 });
    }

    return Response.json({ urls }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
