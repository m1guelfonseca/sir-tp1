const mongoose = require("mongoose");

const alunoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    apelido: { type: String, required: true, trim: true },
    idCurso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true },
    anoCurricular: { type: Number, required: true, min: 1, max: 3 },
  },
  {
    // Na resposta JSON mostra "id" em vez de "_id" e esconde "__v", tal como o json-server.
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (documento, json) => {
        delete json._id;
      },
    },
  }
);

module.exports = mongoose.model("Aluno", alunoSchema);
