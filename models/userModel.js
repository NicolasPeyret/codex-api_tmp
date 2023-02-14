const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Valide l'unicité de l'email

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'service', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    },
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports = {
    User
};