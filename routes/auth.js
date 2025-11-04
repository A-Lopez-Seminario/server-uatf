const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const usuario = await Usuario.findOne({ username, activo: true });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const esValido = await usuario.compararPassword(password);
    if (!esValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { 
        id: usuario._id, 
        username: usuario.username,
        rol: usuario.rol,
        carrerasAsignadas: usuario.carrerasAsignadas
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      usuario: {
        username: usuario.username,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        carrerasAsignadas: usuario.carrerasAsignadas
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener perfil
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Cambiar password
router.post('/cambiar-password', verificarToken, async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuario = await Usuario.findById(req.usuario.id);
    
    const esValido = await usuario.compararPassword(passwordActual);
    if (!esValido) {
      return res.status(401).json({ error: 'Password actual incorrecta' });
    }
    
    usuario.password = passwordNueva;
    await usuario.save();
    
    res.json({ mensaje: 'Password actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar password' });
  }
});

// CRUD Usuarios (solo admin)
router.get('/usuarios', verificarToken, esAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/usuarios', verificarToken, esAdmin, async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/usuarios/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, req.body);
    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/usuarios/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ mensaje: 'Usuario desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
});

module.exports = router;