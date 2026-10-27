// Migra os dados de mock-data/bd.json para o MongoDB.
// Atenção: apaga os alunos e cursos que já existam na base de dados.
const mongoose = require("mongoose");
const ligarBaseDeDados = require("./config/db");
const Curso = require("./models/Curso");
const Aluno = require("./models/Aluno");
const bd = require("../mock-data/bd.json");

async function migrar() {
  await ligarBaseDeDados();

  await Aluno.deleteMany();
  await Curso.deleteMany();

  // No MongoDB cada curso recebe um _id novo.
  // Guardamos a correspondência "id antigo -> id novo" para ligar os alunos ao curso certo.
  const novoIdDoCurso = {};
  for (const curso of bd.cursos) {
    const cursoCriado = await Curso.create({ nomeDoCurso: curso.nomeDoCurso });
    novoIdDoCurso[curso.id] = cursoCriado._id;
  }

  for (const aluno of bd.alunos) {
    await Aluno.create({
      nome: aluno.nome,
      apelido: aluno.apelido,
      idCurso: novoIdDoCurso[aluno.idCurso],
      anoCurricular: aluno.anoCurricular,
    });
  }

  console.log(`Migrados ${bd.cursos.length} cursos e ${bd.alunos.length} alunos.`);
  await mongoose.disconnect();
}

migrar();
