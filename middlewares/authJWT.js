// middlewares/authJWT.js
const jwt = require('jsonwebtoken');

const authJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado: no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adjuntar usuario al request (solo id y role)
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authJWT;
