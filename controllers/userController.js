// On retrouve ici la logique métier en lien avec nos utilisateurs, appliqué aux routes POST pour les opérations d'inscription et de connexion
const bcrypt = require('bcrypt'); // bcrypt pour hasher le mot de passe des utilisateurs
const {
    User
} = require('../models/userModel');
const jwt = require('jsonwebtoken'); // jsonwebtoken pour attribuer un token à un utilisateur au moment ou il se connecte

exports.signup = (req, res, next) => {
    // On appelle la méthode hash de bcrypt et on lui passe le mdp de l'utilisateur, le salte (10) ce sera le nombre de tours qu'on fait faire à l'algorithme
    //verify if role is not admin
    if (req.body.role == 'admin') {
        return res.status(401).send('You are not authorized to signup');
    } else {
        bcrypt.hash(req.body.password, 10)
            // On récupère le hash de mdp qu'on va enregister en tant que nouvel utilisateur dans mongoDB
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash,
                    role: req.body.role
                });
                user.save()
                    .then(() => res.status(200).json({
                        userId: user._id
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            })
            .catch(error => res.status(500).json({
                // On renvoie une erreur 500 si le hash n'a pas pu être créé
                error
            }));
    }
};

exports.index = (req, res, next) => {
    User.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            res.status(500).send(err)
        }
    })
}

// Le Middleware pour la connexion d'un utilisateur vérifie si l'utilisateur existe dans la base MongoDB lors du login
//si oui il vérifie son mot de passe, s'il est bon il renvoie un TOKEN contenant l'id de l'utilisateur, sinon il renvoie une erreur
exports.login = (req, res, next) => {
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({
                            error: 'Mot de passe incorrect !'
                        });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ // on va pouvoir obtenir un token encodé pour cette authentification grâce à jsonwebtoken
                                userId: user._id
                            },
                            process.env.JWT_SECRET, { // Clé d'encodage du token
                                expiresIn: '365d'
                            }
                        )
                    });
                })
                .catch(error => res.status(500).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            error
        }));
};

exports.getUser = (req, res, next) => {
    User.findById(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    error: 'Utilisateur non trouvé !'
                });
            }
            res.status(200).json(user);
        })
        .catch(error => res.status(500).json({
            error
        }));
}

exports.updateUser = (req, res, next) => {
    // On appelle la méthode hash de bcrypt et on lui passe le mdp de l'utilisateur, le salte (10) ce sera le nombre de tours qu'on fait faire à l'algorithme
    if (req.body.password) {
        bcrypt.hash(req.body.password, 10)
            // On récupère le hash de mdp qu'on va enregister en tant que nouvel utilisateur dans mongoDB
            .then(hash => {
                User.findByIdAndUpdate(req.params.id, {
                    $set: {
                        email: req.body.email,
                        password: hash,
                        role: req.body.role,
                        modifiedAt: new Date()
                    }
                }, {
                    new: true
                }, function (err, result) {
                    if (err) {
                        console.log(err.red);
                    }
                    res.status(200).json({
                        success: true,
                        data: {}
                    });
                });
            })
            .catch(error => res.status(500).json({
                // On renvoie une erreur 500 si le hash n'a pas pu être créé
                error
            }));
    } else {
        User.findByIdAndUpdate(req.params.id, {
            $set: {
                email: req.body.email,
                role: req.body.role,
                modifiedAt: new Date()
            }
        }, {
            new: true
        }, function (err, result) {
            if (err) {
                console.log(err.red);
            }
            res.status(200).json({
                success: true,
                data: {}
            });
        });
    }
};

exports.deleteUser = (req, res, next) => {
    User.findByIdAndRemove(req.params.id)
        .then(() => res.status(200).json({
            message: 'Utilisateur supprimé !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
}

//count all users
exports.count = (req, res, next) => {
    User.countDocuments({}, function (err, count) {
        if (err) {
            console.log(err.red);
        }
        res.status(200).json({
            success: true,
            count
        });
    });
}
