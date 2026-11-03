const Curso = require("../models/Curso");
const Aluno = require("../models/Aluno");

// Devolver o documento já atualizado e validar os dados também nas atualizações.
const opcoes_atualizacao = { returnDocument: "after", runValidators: true };

// GET /cursos
async function list_cursos(req, res) {
  const cursos = await Curso.find();
  res.json(cursos);
}

// GET /cursos/:id
async function get_curso(req, res) {
  const curso = await Curso.findById(req.params.id);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.json(curso);
}

// POST /cursos
async function create_curso(req, res) {
  const curso = await Curso.create(req.body);
  res.status(201).json(curso);
}

// PUT /cursos/:id — substitui todos os dados do curso
async function edit_curso(req, res) {
  const curso = await Curso.findOneAndReplace({ _id: req.params.id }, req.body, opcoes_atualizacao);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.json(curso);
}

// PATCH /cursos/:id — altera só os campos enviados
async function patch_curso(req, res) {
  const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, opcoes_atualizacao);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.json(curso);
}

// DELETE /cursos/:id — só é possível se nenhum aluno estiver inscrito no curso
async function delete_curso(req, res) {
  const curso_tem_alunos = await Aluno.exists({ idCurso: req.params.id });
  if (curso_tem_alunos) {
    return res.status(409).json({ erro: "Não é possível apagar um curso que tem alunos" });
  }

  const curso = await Curso.findByIdAndDelete(req.params.id);
  if (!curso) {
    return res.status(404).json({ erro: "Curso não encontrado" });
  }
  res.status(204).end();
}

module.exports = { list_cursos, get_curso, create_curso, edit_curso, patch_curso, delete_curso };
