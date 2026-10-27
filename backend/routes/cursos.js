const express = require("express");
const cursosController = require("../controllers/cursosController");

const router = express.Router();

router.get("/", cursosController.listar);
router.get("/:id", cursosController.obter);
router.post("/", cursosController.criar);
router.put("/:id", cursosController.substituir);
router.patch("/:id", cursosController.atualizar);
router.delete("/:id", cursosController.apagar);

module.exports = router;
