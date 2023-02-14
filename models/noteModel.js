const mongoose = require('mongoose')
const Note = mongoose.model('Note', {
    bookId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        references: {
            model: 'Book',
        }
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        references: {
            model: 'User',
        }
    },
    pageNumber: {
        type: Number,
        default: 0
    },
    noteId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
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
    Note
}