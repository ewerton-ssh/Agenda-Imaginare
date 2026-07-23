const mongoose = require('mongoose');

async function mongoconnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL + process.env.MONGODB_DATABASE);
    console.log('🍃 Conexão com o MongoDB estabelecida');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

async function mongoclose() {
  try {
    await mongoose.connection.close();
    console.log('Conexão com o MongoDB fechada.');
  } catch (error) {
    console.error('Erro ao fechar conexão com o MongoDB:', error);
  }
}

module.exports = { mongoconnect, mongoclose };