const mongoose = require('mongoose')
const Book = mongoose.model('Book', {
    isbn: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        references: {
            model: 'User',
        }
    },
    bookMark: {
        type: Number,
        default: 0
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

module.exports = {
    Book
}