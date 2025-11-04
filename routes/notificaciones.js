const express = require('express');
const router = express.Router();
const Notificacion = require('../models/Notificacion');
const { verificarToken } = require('../middleware/auth');

// Obtener notificaciones del usuario
router.get('/', verificarToken, async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({
      destinatarios: req.usuario.username
    }).sort({ fecha: -1 }).limit(50);
    
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Marcar como leída
router.put('/:id/leer', verificarToken, async (req, res) => {
  try {
    await Notificacion.findByIdAndUpdate(req.params.id, { leida: true });
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

// Marcar todas como leídas
router.put('/leer-todas', verificarToken, async (req, res) => {
  try {
    await Notificacion.updateMany(
      { destinatarios: req.usuario.username, leida: false },
      { leida: true }
    );
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

module.exports = router;