const mongoose = require('mongoose');

const progresoSchema = new mongoose.Schema({
  carrera: {
    type: String,
    required: true
  },
  facultad: {
    type: String,
    required: true
  },
  sede: {
    type: String,
    required: true
  },
  fases: {
    type: Map,
    of: {
      completado: { type: Boolean, default: false },
      inicio: String,
      fin: String,
      observaciones: String,
      documentos: [String],
      responsable: String
    },
    default: {}
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  },
  actualizadoPor: {
    type: String
  }
});

// Índice compuesto para búsquedas rápidas
progresoSchema.index({ carrera: 1, sede: 1 }, { unique: true });

module.exports = mongoose.model('ProgresoCarrera', progresoSchema);