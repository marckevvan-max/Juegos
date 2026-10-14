const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Falta la variable MONGODB_URI (copia .env.example a .env y pon tu cadena de Mongo Atlas).');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB conectado:', mongoose.connection.name);
}

module.exports = connectDB;
