import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${timestamp}-${random}-${basename}${extension}`);
  },
});

// Enhanced file filter with security checks
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Allowed image types
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(
          ", "
        )}`
      )
    );
  }

  // Check file extension matches MIME type
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Extensão de arquivo não permitida"));
  }

  // Basic security: check for suspicious filenames
  if (
    file.originalname.includes("..") ||
    file.originalname.includes("/") ||
    file.originalname.includes("\\")
  ) {
    return cb(new Error("Nome de arquivo suspeito"));
  }

  cb(null, true);
};

// Enhanced limits with better error messages
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB
  files: 1, // Only one file at a time
};

// Error handling middleware for multer
export const handleMulterError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Arquivo muito grande. Tamanho máximo: 2MB",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Apenas um arquivo por vez é permitido",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Campo de arquivo inesperado",
      });
    }
  }

  // Handle other errors
  if (
    error.message.includes("Tipo de arquivo") ||
    error.message.includes("Extensão") ||
    error.message.includes("Nome de arquivo")
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Upload error:", error);
  res.status(500).json({
    success: false,
    message: "Erro interno durante upload",
  });
};

// Export configured multer middleware
export const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Single file upload for avatars
export const uploadAvatar = upload.single("avatar");

// Multiple files upload (if needed in future)
export const uploadMultiple = upload.array("files", 5);
