const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyPassword = require('../middleware/passwordMiddleware');
const {
    authorize
} = require('../middleware/authMiddleware');

// Création des routes Inscription et Connexion de l'API avec les middlewares
// et les controllers d'authentification et de sécurité qui leur sont appliquées
router.get("/count", authorize("service", "admin"), userController.count);
router.get('/', authorize('admin'), userController.index);
router.get('/:id', authorize('admin'), userController.getUser);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

router.post('/signup', verifyPassword, userController.signup);
router.post('/login', userController.login);

module.exports = router;