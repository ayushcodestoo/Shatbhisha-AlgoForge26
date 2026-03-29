const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== CONFIGURATION =====
const UPLOAD_DIR = 'uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Initialize uploads directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  
  res.on('finish', () => {
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode}`);
  });
  
  next();
});

// ===== MULTER CONFIGURATION =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const safeFilename = file.originalname
      .replace(/[^w\s.-]/gi, '')
      .replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${safeFilename}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

// ===== VALIDATION HELPERS =====
const validateNotes = (notes) => {
  if (!notes) return '';
  if (typeof notes !== 'string') {
    throw new Error('Notes must be a string');
  }
  if (notes.length > 1000) {
    throw new Error('Notes must be less than 1000 characters');
  }
  return notes.trim();
};

const validateFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const getFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', reject);
    hash.on('error', reject);
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.pipe(hash);
  });
};

// ===== ERROR HANDLER MIDDLEWARE =====
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ===== API ROUTES =====

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CyberSaathi backend is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

/**
 * Get API info
 * GET /api/info
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'CyberSaathi Backend API',
    version: '2.0.0',
    description: 'Real-Time Fraud Response & Escalation System',
    endpoints: {
      health: 'GET /api/health',
      upload: 'POST /api/evidence/upload',
      getEvidence: 'GET /api/evidence',
      deleteAll: 'DELETE /api/evidence/clear',
      getStats: 'GET /api/evidence/stats'
    }
  });
});

/**
 * Upload evidence file
 * POST /api/evidence/upload
 * Body: { file, notes }
 */
app.post('/api/evidence/upload', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file provided',
      details: 'Please attach a file to upload'
    });
  }

  try {
    // Validate notes
    const notes = validateNotes(req.body.notes);

    // Calculate file hash
    const filePath = path.join(UPLOAD_DIR, req.file.filename);
    const hash = await getFileHash(filePath);
    const timestamp = new Date().toISOString();

    // Get file size from stat
    const stats = fs.statSync(filePath);

    const evidenceItem = {
      id: crypto.randomUUID(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: `/uploads/${req.file.filename}`,
      hash,
      timestamp,
      notes,
      size: req.file.size,
      displaySize: formatFileSize(req.file.size),
      mimetype: req.file.mimetype,
      encoding: req.file.encoding
    };

    console.log(`✅ Evidence uploaded: ${req.file.originalname} | Hash: ${hash.slice(0, 16)}...`);

    res.status(200).json({
      success: true,
      evidence: evidenceItem,
      message: 'Evidence uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload processing failed',
      details: error.message
    });
  }
}), (error, req, res, next) => {
  // Multer error handler
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        details: `Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}`
      });
    }
    if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many file parts'
      });
    }
  }

  if (error && error.message) {
    return res.status(400).json({
      success: false,
      error: 'File validation failed',
      details: error.message
    });
  }

  next();
});

/**
 * Get all uploaded evidence
 * GET /api/evidence
 */
app.get('/api/evidence', asyncHandler(async (req, res) => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    return res.json({
      success: true,
      files: [],
      total: 0,
      message: 'No evidence uploaded yet'
    });
  }

  const files = fs.readdirSync(UPLOAD_DIR).map(filename => {
    const filePath = path.join(UPLOAD_DIR, filename);
    const stats = fs.statSync(filePath);
    return {
      filename,
      path: `/uploads/${filename}`,
      size: stats.size,
      displaySize: formatFileSize(stats.size),
      uploadedAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString()
    };
  });

  res.json({
    success: true,
    files: files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
    total: files.length,
    message: `${files.length} file(s) uploaded`
  });
}));

/**
 * Get evidence statistics
 * GET /api/evidence/stats
 */
app.get('/api/evidence/stats', asyncHandler(async (req, res) => {
  let totalSize = 0;
  let fileCount = 0;

  if (fs.existsSync(UPLOAD_DIR)) {
    const files = fs.readdirSync(UPLOAD_DIR);
    fileCount = files.length;

    files.forEach(filename => {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
  }

  res.json({
    success: true,
    stats: {
      totalFiles: fileCount,
      totalSize: totalSize,
      displaySize: formatFileSize(totalSize),
      maxFileSize: MAX_FILE_SIZE,
      displayMaxSize: formatFileSize(MAX_FILE_SIZE),
      storageUsagePercent: fileCount === 0 ? 0 : Math.round((totalSize / (MAX_FILE_SIZE * 5)) * 100)
    }
  });
}));

/**
 * Delete all evidence (demo cleanup)
 * DELETE /api/evidence/clear
 */
app.delete('/api/evidence/clear', asyncHandler(async (req, res) => {
  if (fs.existsSync(UPLOAD_DIR)) {
    const files = fs.readdirSync(UPLOAD_DIR);
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(UPLOAD_DIR, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete ${file}:`, err);
      }
    });

    console.log(`🗑️ Cleared ${deletedCount} file(s)`);
    res.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} file(s)`
    });
  } else {
    res.json({
      success: true,
      deletedCount: 0,
      message: 'No files to delete'
    });
  }
}));

// ===== ERROR HANDLERS =====

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      health: 'GET /api/health',
      info: 'GET /api/info',
      upload: 'POST /api/evidence/upload',
      getEvidence: 'GET /api/evidence',
      stats: 'GET /api/evidence/stats',
      deleteAll: 'DELETE /api/evidence/clear'
    }
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== UTILITY FUNCTIONS =====

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║   🚨 CyberSaathi Backend v2.0 Started                   ║
║   🌐 http://localhost:${PORT}                               ║
║   📡 API Ready for Evidence Upload & Management         ║
║   💾 Uploads stored in: ./${UPLOAD_DIR}/                  ║
║   📊 Max file size: ${formatFileSize(MAX_FILE_SIZE)}                           ║
║   ✅ CORS enabled | Request logging active              ║
╚═════════════════════════════════════════════════════════╝
`);
});

module.exports = app;
