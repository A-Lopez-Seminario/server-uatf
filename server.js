const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uatf')
  .then(() => console.log('✅ MongoDB conectado correctamente'))
  .catch(err => {
    console.error('❌ Error al conectar MongoDB:', err);
    process.exit(1);
  });

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progreso', require('./routes/progreso'));
app.use('/api/notificaciones', require('./routes/notificaciones'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

### Paso 2.7: Variables de Entorno

**Archivo: `server/.env`**
```
MONGODB_URI=mongodb://localhost:27017/uatf
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion_12345
PORT=5000
NODE_ENV=development
```

**Archivo: `server/.gitignore`**
```
node_modules/
.env
*.log