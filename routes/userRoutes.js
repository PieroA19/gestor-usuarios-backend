// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const userController = require('../controllers/userController');
const authJWT = require('../middlewares/authJWT');
const checkRole = require('../middlewares/checkRole');

// Todas las rutas requieren validación de JWT
router.use(authJWT);

// GET /api/users/      → Listar todos (solo admin)
router.get('/', checkRole('admin'), userController.getAllUsers);

// GET /api/users/:id   → Ver usuario (admin o el mismo)
router.get('/:id', userController.getUserById);

// POST /api/users/     → Crear usuario (solo admin)
router.post(
  '/',
  checkRole('admin'),
  [
    body('name', 'El nombre es obligatorio').not().isEmpty(),
    body('email', 'Por favor ingresa un correo válido').isEmail(),
    body('password', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 }),
    body('role', 'Rol inválido').isIn(['admin', 'usuario']),
  ],
  userController.createUser
);

// PUT /api/users/:id   → Actualizar (admin o mismo usuario)
router.put(
  '/:id',
  [
    // Validaciones opcionales: si vienen campos, verificar formato
    body('name').optional().not().isEmpty().withMessage('El nombre no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Correo inválido'),
    body('password').optional().isLength({ min: 6 }).withMessage('Contraseña muy corta'),
    body('role').optional().isIn(['admin', 'usuario']).withMessage('Rol inválido'),
  ],
  userController.updateUser
);

// DELETE /api/users/:id → Eliminar (solo admin)
router.delete('/:id', checkRole('admin'), userController.deleteUser);

module.exports = router;
