const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
require('dotenv').config();

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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uatf');
    console.log('✅ Conectado a MongoDB');

    // Limpiar usuarios existentes
    await Usuario.deleteMany({});
    console.log('🗑️  Usuarios anteriores eliminados');

    // Crear nuevos usuarios
    for (const userData of usuarios) {
      const usuario = new Usuario(userData);
      await usuario.save();
      console.log(`✅ Usuario creado: ${userData.username}`);
    }

    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('\n📋 Credenciales de acceso:');
    console.log('━'.repeat(50));
    usuarios.forEach(u => {
      console.log(`Usuario: ${u.username}`);
      console.log(`Password: ${u.password}`);
      console.log(`Rol: ${u.rol}`);
      console.log('━'.repeat(50));
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDB();