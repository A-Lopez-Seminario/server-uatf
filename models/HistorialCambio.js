const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
  carrera: {
    type: String,
    required: true
  },
  sede: {
    type: String,
    required: true
  },
  fase: {
    type: Number,
    required: true
  },
  accion: {
    type: String,
    enum: ['completado', 'fecha_inicio', 'fecha_fin', 'observacion', 'documento'],
    required: true
  },
  valorAnterior: mongoose.Schema.Types.Mixed,
  valorNuevo: mongoose.Schema.Types.Mixed,
  usuario: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas por carrera y fecha
historialSchema.index({ carrera: 1, sede: 1, fecha: -1 });

module.exports = mongoose.model('HistorialCambio', historialSchema);