const mongoose = require("mongoose");

// Liga ao MongoDB Atlas com a connection string definida no .env (ou no Vercel).
// Se já estiver ligado, não faz nada (no Vercel a mesma ligação é reaproveitada entre pedidos).
async function connect_base_dados() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Falta a variável MONGODB_URI. Copia o .env.example para .env e preenche-a.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Ligado ao MongoDB");
}

module.exports = connect_base_dados;
