//  Classe responsable de la génération de l’objet de réponse d’erreur
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorResponse;