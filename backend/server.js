const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ligarBaseDeDados = require("./config/db");
const alunosRoutes = require("./routes/alunos");
const cursosRoutes = require("./routes/cursos");

const app = express();

app.use(cors()); // permite pedidos de outro domínio (frontend alojado no Render/Vercel)
app.use(express.json()); // lê o corpo JSON dos pedidos para req.body
app.use(express.static(path.join(__dirname, "..", "frontend"))); // serve também o frontend

app.use("/alunos", alunosRoutes);
app.use("/cursos", cursosRoutes);

// Qualquer outra rota não existe.
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// Tratamento de erros: dados inválidos dão 400, o resto dá 500.
// (No Express 5 os erros das funções async chegam aqui automaticamente.)
app.use((erro, req, res, next) => {
  const dadosInvalidos =
    erro instanceof mongoose.Error.ValidationError ||
    erro instanceof mongoose.Error.CastError ||
    erro.type === "entity.parse.failed"; // JSON mal formado

  if (dadosInvalidos) {
    return res.status(400).json({ erro: erro.message });
  }

  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;

ligarBaseDeDados().then(() => {
  app.listen(PORT, () => console.log(`API a correr em http://localhost:${PORT}`));
});
