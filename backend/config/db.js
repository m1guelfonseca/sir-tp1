const mongoose = require("mongoose");

// Liga ao MongoDB Atlas com a connection string definida no .env (ou no Render).
async function ligarBaseDeDados() {
  if (!process.env.MONGODB_URI) {
    console.error("Falta a variável MONGODB_URI. Copia o .env.example para .env e preenche-a.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Ligado ao MongoDB");
}

module.exports = ligarBaseDeDados;
