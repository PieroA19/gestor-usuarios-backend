// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name', 'El nombre es obligatorio').not().isEmpty(),
    body('email', 'Por favor ingresa un correo válido').isEmail(),
    body('password', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 }),
    // Opcional: validar rol si se envía
    body('role').optional().isIn(['admin', 'usuario']).withMessage('Rol inválido'),
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email', 'Por favor ingresa un correo válido').isEmail(),
    body('password', 'La contraseña es obligatoria').exists(),
  ],
  authController.login
);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
