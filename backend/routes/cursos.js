const express = require("express");
const cursos_controller = require("../controllers/cursosController");

const router = express.Router();

router.get("/", cursos_controller.list_cursos);
router.get("/:id", cursos_controller.get_curso);
router.post("/", cursos_controller.create_curso);
router.put("/:id", cursos_controller.edit_curso);
router.patch("/:id", cursos_controller.patch_curso);
router.delete("/:id", cursos_controller.delete_curso);

module.exports = router;
