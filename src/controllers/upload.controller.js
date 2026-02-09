import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "clothing-webapp"
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id
  });
}


export async function deleteImage(req, res) {
  const publicId = decodeURIComponent(req.params.publicId);

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image"
  });

  // result: { result: "ok" } or { result: "not found" }
  res.json({ ok: true, cloudinary: result });
}

export async function uploadMultipleImages(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const uploads = [];

  for (const file of req.files) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "clothing-webapp"
    });

    uploads.push({
      url: result.secure_url,
      publicId: result.public_id
    });
  }

  res.status(201).json({ images: uploads });
}
