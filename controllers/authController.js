// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// Registro de usuario
exports.register = async (req, res) => {
  // Validaciones de express-validator (si las usamos)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'El correo ya está en uso. Por favor inicia sesión.' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario en BD
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'usuario', // si no envían rol, por defecto “usuario”
    });

    // Generar token
    const token = generateToken(user);

    // Enviar datos básicos y token
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario por correo
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Correo o contraseña incorrectos' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'Correo o contraseña incorrectos' });
    }

    // Generar token
    const token = generateToken(user);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Logout (sólo para el frontend: limpiar token, en backend no hay estado)
exports.logout = (req, res) => {
  // Simplemente devolvemos un mensaje; el frontend debe eliminar el token localmente
  res.json({ message: 'Sesión cerrada correctamente' });
};
