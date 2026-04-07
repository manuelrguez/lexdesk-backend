const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ts   = Date.now()
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${ts}_${safe}`)
  },
})

module.exports = multer({
  storage,
  fileFilter: (req, file, cb) =>
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Solo se permiten PDFs')),
  limits: { fileSize: 20 * 1024 * 1024 },
})