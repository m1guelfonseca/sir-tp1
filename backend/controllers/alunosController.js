const Aluno = require("../models/Aluno");

// Devolver o documento já atualizado e validar os dados também nas atualizações.
const opcoes_atualizacao = { returnDocument: "after", runValidators: true };

// GET /alunos
async function list_alunos(req, res) {
  const alunos = await Aluno.find();
  res.json(alunos);
}

// GET /alunos/:id
async function get_aluno(req, res) {
  const aluno = await Aluno.findById(req.params.id);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.json(aluno);
}

// POST /alunos
async function create_aluno(req, res) {
  const aluno = await Aluno.create(req.body);
  res.status(201).json(aluno);
}

// PUT /alunos/:id — substitui todos os dados do aluno
async function edit_aluno(req, res) {
  const aluno = await Aluno.findOneAndReplace({ _id: req.params.id }, req.body, opcoes_atualizacao);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.json(aluno);
}

// PATCH /alunos/:id — altera só os campos enviados
async function patch_aluno(req, res) {
  const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, opcoes_atualizacao);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.json(aluno);
}

// DELETE /alunos/:id
async function delete_aluno(req, res) {
  const aluno = await Aluno.findByIdAndDelete(req.params.id);
  if (!aluno) {
    return res.status(404).json({ erro: "Aluno não encontrado" });
  }
  res.status(204).end();
}

module.exports = { list_alunos, get_aluno, create_aluno, edit_aluno, patch_aluno, delete_aluno };
