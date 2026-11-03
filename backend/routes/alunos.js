const express = require("express");
const alunos_controller = require("../controllers/alunosController");

const router = express.Router();

router.get("/", alunos_controller.list_alunos);
router.get("/:id", alunos_controller.get_aluno);
router.post("/", alunos_controller.create_aluno);
router.put("/:id", alunos_controller.edit_aluno);
router.patch("/:id", alunos_controller.patch_aluno);
router.delete("/:id", alunos_controller.delete_aluno);

module.exports = router;
