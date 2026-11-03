// A aplicação Express: configuração, documentação, rotas e tratamento de erros.
// É usada pelo server.js (no teu computador) e pelo api/index.js (no Vercel).
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const swagger_ui = require("swagger-ui-express");
const documentacao_api = require("./docs/swagger.json");
const connect_base_dados = require("./config/db");
const rotas_alunos = require("./routes/alunos");
const rotas_cursos = require("./routes/cursos");

const app = express();

// ---------- Configuração ----------

app.use(cors()); // permite pedidos de outro domínio
app.use(express.json()); // lê o corpo JSON dos pedidos para req.body
app.use(express.static(path.join(__dirname, "..", "frontend"))); // serve o frontend (no teu computador)

// ---------- Documentação (Swagger) em /api-docs ----------

// O estilo e os scripts do Swagger vêm de um CDN, porque no Vercel os ficheiros locais não ficam disponíveis.
const SWAGGER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14";
const opcoes_swagger = {
  customSiteTitle: "API de Alunos e Cursos",
  customCssUrl: `${SWAGGER_CDN}/swagger-ui.min.css`,
  customJs: [`${SWAGGER_CDN}/swagger-ui-bundle.min.js`, `${SWAGGER_CDN}/swagger-ui-standalone-preset.min.js`],
};

app.use("/api-docs", swagger_ui.serve, swagger_ui.setup(documentacao_api, opcoes_swagger));

// ---------- Rotas da API ----------

// Garante que há ligação ao MongoDB antes de responder aos pedidos da API.
async function ensure_base_dados(req, res, next) {
  await connect_base_dados();
  next();
}

app.use(ensure_base_dados);
app.use("/alunos", rotas_alunos);
app.use("/cursos", rotas_cursos);

// ---------- Erros ----------

// Qualquer outra rota não existe.
function handle_rota_inexistente(req, res) {
  res.status(404).json({ erro: "Rota não encontrada" });
}

// Dados inválidos dão 400, o resto dá 500.
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

module.exports = app;
