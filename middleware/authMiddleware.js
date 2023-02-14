// Middleware qui protégera les routes sélectionnées et vérifier que l'utilisateur est authentifié avant d'autoriser l'envoi de ses requêtes.
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const asyncHandler = require('./asyncMiddleware');
const ErrorResponse = require('../utils/errorResponse');
const {
    User
} = require('../models/userModel');

// On vérifie le TOKEN de l'utilisateur, s'il correspond à l'id de l'utilisateur dans la requête, il sera autorisé à changer les données correspondantes.
exports.auth = (req, res, next) => {
    try {
        if (req.headers.authorization == undefined) {
            return next(new ErrorResponse('No token provided', 401));
        } else {
            const token = req.headers.authorization.split(' ')[1];
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId != userId) {
            throw 'Invalid user Id';
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        if (req.headers.authorization == undefined) {
            return next(new ErrorResponse('No token provided', 401));
        } else {
            token = req.headers.authorization.split(' ')[1];
        }
    }
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (req.headers.authorization == undefined) {
            return next(new ErrorResponse('No token provided', 401));
        } else {
            token = req.headers.authorization.split(' ')[1];
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        User.findById(decodedToken.userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: 'Utilisateur non trouvé !'
                    });
                }
                if (!roles.includes(user.role)) {
                    return next(new ErrorResponse('not authorized to access this route', 403));
                }
                next();
            })
            .catch(error => res.status(500).json({
                error
            }));
    };
};