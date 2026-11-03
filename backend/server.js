const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connect_base_dados = require("./config/db");
const rotas_alunos = require("./routes/alunos");
const rotas_cursos = require("./routes/cursos");

const app = express();

app.use(cors()); // permite pedidos de outro domínio (frontend alojado no Render/Vercel)
app.use(express.json()); // lê o corpo JSON dos pedidos para req.body
app.use(express.static(path.join(__dirname, "..", "frontend"))); // serve também o frontend

app.use("/alunos", rotas_alunos);
app.use("/cursos", rotas_cursos);

// Qualquer outra rota não existe.
function handle_rota_inexistente(req, res) {
  res.status(404).json({ erro: "Rota não encontrada" });
}

// Tratamento de erros: dados inválidos dão 400, o resto dá 500.
// (No Express 5 os erros das funções async chegam aqui automaticamente.)
function handle_erro(erro, req, res, next) {
  const dados_invalidos =
    erro instanceof mongoose.Error.ValidationError ||
    erro instanceof mongoose.Error.CastError ||
    erro.type === "entity.parse.failed"; // JSON mal formado

  if (dados_invalidos) {
    return res.status(400).json({ erro: erro.message });
  }

  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
}

app.use(handle_rota_inexistente);
app.use(handle_erro);

const porta = process.env.PORT || 3000;

connect_base_dados().then(() => {
  app.listen(porta, () => console.log(`API a correr em http://localhost:${porta}`));
});
