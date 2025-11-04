const express = require('express');
const router = express.Router();
const ProgresoCarrera = require('../models/ProgresoCarrera');
const HistorialCambio = require('../models/HistorialCambio');
const Notificacion = require('../models/Notificacion');
const { verificarToken } = require('../middleware/auth');

// Obtener progreso de una carrera
router.get('/carreras/:carrera/:sede', verificarToken, async (req, res) => {
  try {
    const { carrera, sede } = req.params;
    const progreso = await ProgresoCarrera.findOne({ carrera, sede });
    
    if (!progreso) {
      return res.json({ fases: {} });
    }
    
    res.json(progreso);
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
});

// Obtener todos los progresos
router.get('/carreras', verificarToken, async (req, res) => {
  try {
    const progresos = await ProgresoCarrera.find();
    res.json(progresos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener progresos' });
  }
});

// Guardar/Actualizar progreso
router.post('/carreras/:carrera/:sede', verificarToken, async (req, res) => {
  try {
    const { carrera, sede } = req.params;
    const { fases, facultad } = req.body;
    
    // Obtener progreso anterior para historial
    const progresoAnterior = await ProgresoCarrera.findOne({ carrera, sede });
    
    const progreso = await ProgresoCarrera.findOneAndUpdate(
      { carrera, sede },
      { 
        fases, 
        facultad,
        ultimaActualizacion: new Date(),
        actualizadoPor: req.usuario.username
      },
      { upsert: true, new: true }
    );
    
    // Registrar cambios en historial
    if (progresoAnterior) {
      const fasesAnteriores = progresoAnterior.fases;
      const fasesNuevas = new Map(Object.entries(fases));
      
      for (const [faseNum, datosNuevos] of fasesNuevas) {
        const datosAnteriores = fasesAnteriores.get(faseNum);
        
        if (JSON.stringify(datosAnteriores) !== JSON.stringify(datosNuevos)) {
          await HistorialCambio.create({
            carrera,
            sede,
            fase: parseInt(faseNum),
            accion: 'actualizacion',
            valorAnterior: datosAnteriores,
            valorNuevo: datosNuevos,
            usuario: req.usuario.username
          });
          
          // Crear notificación si se completó una fase
          if (datosNuevos.completado && !datosAnteriores?.completado) {
            await Notificacion.create({
              tipo: 'fase_completada',
              titulo: 'Fase Completada',
              mensaje: `Se completó la fase ${faseNum} en ${carrera} - ${sede}`,
              carrera,
              sede,
              destinatarios: ['admin']
            });
          }
        }
      }
    }
    
    res.json(progreso);
  } catch (error) {
    console.error('Error al guardar progreso:', error);
    res.status(500).json({ error: 'Error al guardar progreso' });
  }
});

// Obtener historial de cambios
router.get('/historial/:carrera/:sede', verificarToken, async (req, res) => {
  try {
    const { carrera, sede } = req.params;
    const historial = await HistorialCambio.find({ carrera, sede })
      .sort({ fecha: -1 })
      .limit(100);
    
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Estadísticas generales
router.get('/estadisticas', verificarToken, async (req, res) => {
  try {
    const progresos = await ProgresoCarrera.find();
    
    const stats = {
      totalCarreras: progresos.length,
      carrerasCompletadas: 0,
      carrerasEnProceso: 0,
      carrerasSinIniciar: 0,
      progresoPromedio: 0
    };
    
    let sumaProgreso = 0;
    
    progresos.forEach(prog => {
      const fasesArray = Array.from(prog.fases.values());
      const completadas = fasesArray.filter(f => f.completado).length;
      const porcentaje = (completadas / 12) * 100;
      
      sumaProgreso += porcentaje;
      
      if (porcentaje === 100) stats.carrerasCompletadas++;
      else if (porcentaje > 0) stats.carrerasEnProceso++;
      else stats.carrerasSinIniciar++;
    });
    
    stats.progresoPromedio = progresos.length > 0 
      ? Math.round(sumaProgreso / progresos.length) 
      : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;