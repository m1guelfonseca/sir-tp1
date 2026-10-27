const express = require("express");
const alunosController = require("../controllers/alunosController");

const router = express.Router();

router.get("/", alunosController.listar);
router.get("/:id", alunosController.obter);
router.post("/", alunosController.criar);
router.put("/:id", alunosController.substituir);
router.patch("/:id", alunosController.atualizar);
router.delete("/:id", alunosController.apagar);

module.exports = router;
