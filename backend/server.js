// Arranca a API no teu computador (npm start). No Vercel este ficheiro não é usado.
const app = require("./app");
const connect_base_dados = require("./config/db");

const porta = process.env.PORT || 3000;

connect_base_dados().then(() => {
  app.listen(porta, () => console.log(`API a correr em http://localhost:${porta}`));
});
