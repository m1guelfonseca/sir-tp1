// Função do Vercel: cada pedido a /alunos ou /cursos é entregue à app Express do backend.
// (as rotas estão definidas no vercel.json)
const app = require("../backend/app");

module.exports = app;
