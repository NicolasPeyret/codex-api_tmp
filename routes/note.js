const express = require('express');
const router = express.Router();

// Require controller modules.
const noteController = require('../controllers/noteController');
const { authorize } = require('../middleware/authMiddleware');

// info Postman : Créer dans le header 
// Authorization : Bearer <token>
router.get('/', authorize('user','admin'), noteController.index);
router.get("/count", authorize("user", "service", "admin"), noteController.count);
router.get('/:id', authorize('user','admin'), noteController.searchById);
router.post('/', authorize('user','admin'), noteController.insert);
router.put('/:id', authorize('user','admin'), noteController.update);
router.delete('/:id', authorize('user','admin'), noteController.delete);

module.exports = router;