const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// IMPORTANTE: Reemplaza esto con tu connection string real
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://uatf_admin:password1234@uatf-cluster.d0xrhpu.mongodb.net/uatf?retryWrites=true&w=majority&appName=uatf-cluster';

const usuarios = [
  {
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador General',
    email: 'admin@uatf.edu.bo',
    rol: 'admin',
    carrerasAsignadas: []
  },
  {
    username: 'coordinador',
    password: 'coord123',
    nombre: 'Coordinador Académico',
    email: 'coordinador@uatf.edu.bo',
    rol: 'coordinador',
    carrerasAsignadas: []
  },
  {
    username: 'director.informatica',
    password: 'dir123',
    nombre: 'Director de Ingeniería Informática',
    email: 'director.informatica@uatf.edu.bo',
    rol: 'director',
    carrerasAsignadas: ['Ingeniería Informática']
  }
];

async function initDB() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB PRODUCCIÓN');

    await Usuario.deleteMany({});
    console.log('🗑️  Usuarios anteriores eliminados');

    for (const userData of usuarios) {
      const usuario = new Usuario(userData);
      await usuario.save();
      console.log(`✅ Usuario creado: ${userData.username}`);
    }

    console.log('\n✅ Base de datos inicializada');
    console.log('\n📋 Credenciales:');
    usuarios.forEach(u => {
      console.log(`Usuario: ${u.username} | Password: ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDB();