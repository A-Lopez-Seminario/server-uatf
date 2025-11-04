const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['fase_completada', 'fecha_vencida', 'actualizacion', 'asignacion'],
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  carrera: String,
  sede: String,
  destinatarios: [{
    type: String
  }],
  leida: {
    type: Boolean,
    default: false
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);