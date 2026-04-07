// // const jwt = require('jsonwebtoken');
// // const { JWT_SECRET } = require('../controllers/adminAuthController');

// require("dotenv").config();
// const JWT_SECRET = process.env.JWT_SECRET;



// // Middleware to verify admin authentication
// const authenticateAdmin = (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access denied. No token provided.'
//       });
//     }

//     const token = authHeader.split(' ')[1];

//     // Verify token
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Add admin info to request
//     req.admin = decoded;

//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired. Please login again.'
//       });
//     }

//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token. Please login again.'
//       });
//     }

//     return res.status(401).json({
//       success: false,
//       message: 'Authentication failed.'
//     });
//   }
// };

// // Middleware to check if admin is super admin
// const requireSuperAdmin = (req, res, next) => {
//   if (req.admin.role !== 'super_admin') {
//     return res.status(403).json({
//       success: false,
//       message: 'Access denied. Super admin privileges required.'
//     });
//   }
//   next();
// };

// module.exports = {
//   authenticateAdmin,
//   requireSuperAdmin
// };
// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = require('../controllers/adminAuthController');

const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;




// Middleware to verify admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    // Debug: log incoming auth header for troubleshooting
    console.log('[authenticateAdmin] Authorization header:', authHeader && authHeader.substring(0, 50));

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Debug: show decoded token (partial)
    console.log('[authenticateAdmin] Decoded token:', {
      id: decoded && decoded.id,
      role: decoded && decoded.role
    });

    // If role is missing in token, try to fetch role from DB as a fallback
    if (!decoded.role) {
      try {
        const db = require('../config/db');
        const [rows] = await db.query('SELECT role FROM admin_users WHERE id = ?', [decoded.id]);
        if (rows && rows.length) {
          decoded.role = rows[0].role;
          console.log('[authenticateAdmin] Fallback role from DB:', decoded.role);
        }
      } catch (dbErr) {
        console.error('[authenticateAdmin] DB lookup error:', dbErr.message || dbErr);
      }
    }

    // Allow if role exists and is valid
    if (!decoded.role || !["admin", "super_admin"].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    // Add admin info to request
    req.admin = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Middleware to check if admin is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin privileges required."
    });
  }
  next();
};


module.exports = {
  authenticateAdmin,
  requireSuperAdmin
};
