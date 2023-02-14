const passwordValidator = require('password-validator');
const fs = require('fs');
let blacklistedMdp = [];

try {
    const textFile = fs.readFileSync("./public/res/worst-passwords.txt", 'utf-8');
    blacklistedMdp = textFile.split('\n');
} catch (e) {
    console.log(e.red);
}

// Schéma de mot de passe plus sécure
const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(8) // Longueur minimun : 8
    .has().uppercase() // Doit avoir au moins une majuscule
    .has().lowercase() // Doit avoir au moins une minuscule
    .has().digits() // Doit avoir au moins un chiffre
    .has().not().spaces() // Ne doit pas avoir d'espaces
    .is().not().oneOf(blacklistedMdp); // Blacklist de valeurs à proscrire

module.exports = passwordSchema;