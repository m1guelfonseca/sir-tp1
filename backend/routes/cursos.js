const express = require("express");
const cursos = require("../controllers/cursosController");

const router = express.Router();

router.get("/", cursos.listar);
router.get("/:id", cursos.obter);
router.post("/", cursos.criar);
router.put("/:id", cursos.substituir);
router.patch("/:id", cursos.atualizar);
router.delete("/:id", cursos.apagar);

module.exports = router;
