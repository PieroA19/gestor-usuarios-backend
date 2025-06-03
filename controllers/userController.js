// controllers/userController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// 1. Obtener lista de todos los usuarios (solo admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Excluir campo password
    return res.json({ users });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// 2. Obtener un solo usuario por id (solo admin o el mismo usuario)
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  // Si es usuario normal, sólo permite ver su propio perfil
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Acceso prohibido' });
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('Error en getUserById:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// 3. Crear un nuevo usuario (solo admin)
exports.createUser = async (req, res) => {
  // Validar campos
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
        .json({ message: 'El correo ya está en uso' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'usuario',
    });

    return res
      .status(201)
      .json({ user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Error en createUser:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// 4. Actualizar usuario (admin puede actualizar cualquiera; usuario normal sólo su perfil)
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  // Validar campos si usamos express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Si es usuario normal, sólo puede actualizar su propio perfil
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Acceso prohibido' });
  }

  const { name, email, password, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Sólo admin puede cambiar rol
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo admin puede cambiar el rol' });
    }

    // Actualizar campos permitidos
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (role) user.role = role;

    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// 5. Eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminamos directamente con findByIdAndDelete:
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

