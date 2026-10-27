const Curso = require("../models/Curso");
const Aluno = require("../models/Aluno");

// Devolver o documento já atualizado e validar os dados também nas atualizações.
const opcoes = { returnDocument: "after", runValidators: true };

// GET /cursos
async function listar(req, res) {
  const cursos = await Curso.find();
  res.json(cursos);
}

// GET /cursos/:id
async function obter(req, res) {
  const curso = await Curso.findById(req.params.id);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.json(curso);
}

// POST /cursos
async function criar(req, res) {
  const curso = await Curso.create(req.body);
  res.status(201).json(curso);
}

// PUT /cursos/:id — substitui o curso inteiro
async function substituir(req, res) {
  const curso = await Curso.findOneAndReplace({ _id: req.params.id }, req.body, opcoes);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.json(curso);
}

// PATCH /cursos/:id — altera só os campos enviados
async function atualizar(req, res) {
  const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, opcoes);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.json(curso);
}

// DELETE /cursos/:id — só é possível se nenhum aluno estiver inscrito no curso
async function apagar(req, res) {
  const temAlunos = await Aluno.exists({ idCurso: req.params.id });
  if (temAlunos) {
    return res.status(409).json({ erro: "Não é possível apagar um curso que tem alunos" });
  }

  const curso = await Curso.findByIdAndDelete(req.params.id);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.status(204).end();
}

module.exports = { listar, obter, criar, substituir, atualizar, apagar };
