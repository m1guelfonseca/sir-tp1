const mongoose = require("mongoose");

const cursoSchema = new mongoose.Schema(
  {
    nomeDoCurso: { type: String, required: true, trim: true },
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

module.exports = mongoose.model("Curso", cursoSchema);
