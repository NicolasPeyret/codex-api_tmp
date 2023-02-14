const express = require("express");
const router = express.Router();

// Require controller modules.
const bookController = require("../controllers/bookController");
const {
  authorize
} = require("../middleware/authMiddleware");

// info Postman : Créer dans le header
// Authorization : Bearer <token>

router.get("/", authorize("user", "admin"), bookController.index);
router.get("/count", authorize("user", "service", "admin"), bookController.count);
router.get("/:id", authorize("user", "admin"), bookController.searchById);
router.post("/", authorize("user", "admin"), bookController.insert);
router.put("/:id", authorize("user", "admin"), bookController.update);
router.delete("/:id", authorize("user", "admin"), bookController.delete);

module.exports = router;