// middlewares/checkRole.js
const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso prohibido: rol insuficiente' });
    }
    next();
  };
};

module.exports = checkRole;
