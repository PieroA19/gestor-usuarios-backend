// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware: parse JSON y CORS
app.use(express.json());
app.use(cors());

// Importar rutas (las crearemos luego)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Conexión a MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🔗 Conectado a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });

// Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
