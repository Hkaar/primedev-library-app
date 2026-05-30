import cloudinary from "../../lib/cloudinary.js";

export const getFileUrl = (publicId: string) => {
  return cloudinary.v2.url(publicId);
};

export const uploadFile = async (
  file: any,
  options: any = {
    folder: "library-api/book/covers",
  },
) => {
  try {
    // Mengunggah file ke Cloudinary menggunakan metode uploader.upload
    // File diunggah dalam format base64 dengan menyertakan tipe MIME
    // Opsi tambahan dapat disertakan, seperti folder tujuan di Cloudinary
    // Hasil upload akan berisi informasi tentang file yang diunggah, termasuk URL dan public_id
    const result = await cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      options,
    );

    return result;
  } catch (error) {
    console.error("Error uploading image:", (error as any).message);

    throw new Error("Error uploading image");
  }
};

export const deleteFile = async (publicId: string) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);

    return result;
  } catch (error) {
    console.error("Error deleting image:", (error as any).message);

    throw new Error("Error deleting image");
  }
};
