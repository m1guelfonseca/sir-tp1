// Migra os dados de mock-data/bd.json para o MongoDB.
// Atenção: apaga os alunos e cursos que já existam na base de dados.
const mongoose = require("mongoose");
const connect_base_dados = require("./config/db");
const Curso = require("./models/Curso");
const Aluno = require("./models/Aluno");
const dados_originais = require("../mock-data/bd.json");

async function migrate_dados() {
  await connect_base_dados();

  await Aluno.deleteMany();
  await Curso.deleteMany();

  // No MongoDB cada curso recebe um _id novo.
  // Guardamos a correspondência "id antigo -> id novo" para ligar os alunos ao curso certo.
  const novo_id_curso = {};
  for (const curso of dados_originais.cursos) {
    const curso_criado = await Curso.create({ nomeDoCurso: curso.nomeDoCurso });
    novo_id_curso[curso.id] = curso_criado._id;
  }

  for (const aluno of dados_originais.alunos) {
    await Aluno.create({
      nome: aluno.nome,
      apelido: aluno.apelido,
      idCurso: novo_id_curso[aluno.idCurso],
      anoCurricular: aluno.anoCurricular,
    });
  }

  console.log(`Migrados ${dados_originais.cursos.length} cursos e ${dados_originais.alunos.length} alunos.`);
  await mongoose.disconnect();
}

migrate_dados();
