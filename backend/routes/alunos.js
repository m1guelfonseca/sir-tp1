const express = require("express");
const alunos = require("../controllers/alunosController");

const router = express.Router();

router.get("/", alunos.listar);
router.get("/:id", alunos.obter);
router.post("/", alunos.criar);
router.put("/:id", alunos.substituir);
router.patch("/:id", alunos.atualizar);
router.delete("/:id", alunos.apagar);

module.exports = router;
