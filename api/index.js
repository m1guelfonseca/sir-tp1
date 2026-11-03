// Função do Vercel: os pedidos a /alunos, /cursos e /api-docs são entregues à app Express do backend.
// (essas regras estão no vercel.json; o resto do site é a pasta frontend)
const app = require("../backend/app");

module.exports = app;
