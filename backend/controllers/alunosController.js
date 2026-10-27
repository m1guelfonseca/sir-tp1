const Aluno = require("../models/Aluno");

// Devolver o documento já atualizado e validar os dados também nas atualizações.
const opcoes = { returnDocument: "after", runValidators: true };

// GET /alunos
async function listar(req, res) {
  const alunos = await Aluno.find();
  res.json(alunos);
}

// GET /alunos/:id
async function obter(req, res) {
  const aluno = await Aluno.findById(req.params.id);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.json(aluno);
}

// POST /alunos
async function criar(req, res) {
  const aluno = await Aluno.create(req.body);
  res.status(201).json(aluno);
}

// PUT /alunos/:id — substitui o aluno inteiro
async function substituir(req, res) {
  const aluno = await Aluno.findOneAndReplace({ _id: req.params.id }, req.body, opcoes);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.json(aluno);
}

// PATCH /alunos/:id — altera só os campos enviados
async function atualizar(req, res) {
  const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, opcoes);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.json(aluno);
}

// DELETE /alunos/:id
async function apagar(req, res) {
  const aluno = await Aluno.findByIdAndDelete(req.params.id);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.status(204).end();
}

module.exports = { listar, obter, criar, substituir, atualizar, apagar };
