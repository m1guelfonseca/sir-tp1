// Migra os dados de mock-data/bd.json para o MongoDB.
// Atenção: apaga os alunos e cursos que já existam na base de dados.
const mongoose = require("mongoose");
const ligarBaseDeDados = require("./config/db");
const Curso = require("./models/Curso");
const Aluno = require("./models/Aluno");
const dadosOriginais = require("../mock-data/bd.json");

async function migrarDados() {
  await ligarBaseDeDados();

  await Aluno.deleteMany();
  await Curso.deleteMany();

  // No MongoDB cada curso recebe um _id novo.
  // Guardamos a correspondência "id antigo -> id novo" para ligar os alunos ao curso certo.
  const novoIdDoCurso = {};
  for (const curso of dadosOriginais.cursos) {
    const cursoCriado = await Curso.create({ nomeDoCurso: curso.nomeDoCurso });
    novoIdDoCurso[curso.id] = cursoCriado._id;
  }

  for (const aluno of dadosOriginais.alunos) {
    await Aluno.create({
      nome: aluno.nome,
      apelido: aluno.apelido,
      idCurso: novoIdDoCurso[aluno.idCurso],
      anoCurricular: aluno.anoCurricular,
    });
  }

  console.log(`Migrados ${dadosOriginais.cursos.length} cursos e ${dadosOriginais.alunos.length} alunos.`);
  await mongoose.disconnect();
}

migrarDados();
