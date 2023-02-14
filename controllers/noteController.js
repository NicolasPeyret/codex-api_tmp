const colors = require('colors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const {
    Note
} = require('../models/noteModel');
const {
    User
} = require('../models/userModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.index = (req, res) => {
    Note.find((err, docs) => {
        if (!err) {
            const filters = req.query;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, JWT_SECRET);
            const userId = decodedToken.userId;
            User.findOne({
                    _id: userId
                })
                .then(user => {
                    if (user.role === 'admin') {
                        if (Object.keys(filters).length === 0 && filters.constructor === Object) {
                            res.status(200).send(docs);
                        } else {
                            const filteredNotes = docs.filter(note => {
                                if (note.userId == userId) {
                                    let querySearch = true;
                                    for (key in filters) {
                                        querySearch = note[key] == filters[key];
                                    }
                                    return querySearch;
                                }
                            });
                            if (filteredNotes.length > 0) {
                                res.status(200).send(filteredNotes);
                            } else {
                                res.send(`No record with query given`);
                            }
                        }
                    } else {
                        if (Object.keys(filters).length === 0 && filters.constructor === Object) {
                            res.send(docs.filter(note => note.userId == userId));
                        } else {
                            const filteredNotes = docs.filter(note => {
                                if (note.userId == userId) {
                                    let querySearch = true;
                                    for (key in filters) {
                                        querySearch = note[key] == filters[key];
                                    }
                                    return querySearch;
                                }
                            });
                            if (filteredNotes.length > 0) {
                                res.status(200).send(filteredNotes);
                            } else {
                                res.send(`No record with query given`);
                            }
                        }
                    }
                });
        } else {
            res.status(500).send(err)
        }
    })
};

//findById
exports.searchById = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    Note.findOne({
            _id: req.params.id
        })
        .then(note => {
            User.findOne({
                    _id: userId
                })
                .then(user => {
                    if (user.role === 'admin') {
                        res.status(200).send(book);
                    } else {
                        if (userId != note.userId.toString()) {
                            return res.status(401).send(`You are not authorized to visualize this record`)
                        } else {
                            try {
                                res.status(200).send(note)
                            } catch (e) {
                                res.status(500).send(e)
                            }
                        }
                    }
                });
        });
};

//Create new note
exports.insert = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    User.findOne({
            _id: userId
        })
        .then(user => {
            if (user.role === 'admin') {
                let selectedUserId = user._id;
                if (req.body.userId) {
                    selectedUserId = req.body.userId;
                }
                const newNote = new Note({
                    content: req.body.content,
                    bookId: req.body.bookId,
                    noteId: req.body.noteId,
                    userId: selectedUserId,
                    title: req.body.title,
                    pageNumber: req.body.pageNumber
                });
                newNote.save((err, docs) => {
                    if (!err) {
                        res.status(201).send(docs)
                    } else {
                        res.status(500).send(err)
                    }
                });
            } else {
                const newNote = new Note({
                    content: req.body.content,
                    bookId: req.body.bookId,
                    noteId: req.body.noteId,
                    userId: userId,
                    title: req.body.title,
                    pageNumber: req.body.pageNumber
                });
                newNote.save((err, docs) => {
                    if (!err) {
                        res.status(201).send(docs)
                    } else {
                        res.status(500).send(err)
                    }
                });
            }
        });
}

//Update
exports.update = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    const id = req.params.id;
    // console.log(`update with given id: ${id}`.green.inverse);

    if (!ObjectId.isValid(id)) {
        return res.send(400).send(`No record with given id: ${id}`)
    }

    Note.findOne({
            _id: req.params.id
        })
        .then(note => {
            User.findOne({
                    _id: userId
                })
                .then(user => {
                    //if role is admin and there is no filter
                    if (user.role === 'admin') {
                        let selectedUserId = user._id;
                        if (req.body.userId) {
                            selectedUserId = req.body.userId;
                        }
                        Note.findByIdAndUpdate(id, {
                            $set: {
                                content: req.body.content,
                                bookId: req.body.bookId,
                                title: req.body.title,
                                noteId: req.body.noteId,
                                userId: selectedUserId,
                                pageNumber: req.body.pageNumber,
                                modifiedAt: new Date()
                            }
                        }, {
                            new: true
                        }, (err, docs) => {
                            if (!err) {
                                res.status(200).send(docs)
                            } else {
                                console.log('Error while updating the data' + JSON.stringify(err, undefined, 2).red)
                            }
                        });
                    } else {
                        if (userId != note.userId.toString()) {
                            return res.status(401).send(`You are not authorized to update this record`)
                        } else {

                            if (!ObjectId.isValid(id)) {
                                return res.send(400).send(`No record with given id: ${id}`.green.inverse)
                            }

                            Note.findByIdAndUpdate(id, {
                                $set: {
                                    content: req.body.content,
                                    bookId: req.body.bookId,
                                    title: req.body.title,
                                    noteId: req.body.noteId,
                                    userId: userId,
                                    pageNumber: req.body.pageNumber,
                                    modifiedAt: new Date()
                                }
                            }, {
                                new: true
                            }, (err, docs) => {
                                if (!err) {
                                    res.status(200).send(docs)
                                } else {
                                    console.log('Error while updating the data' + JSON.stringify(err, undefined, 2).red)
                                }
                            })
                        }
                    }
                });
        });
}

//Delete
exports.delete = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.send(400).send(`No record with given id: ${id}`)
    }

    Note.findOne({
            _id: req.params.id
        })
        .then(note => {
            User.findOne({
                    _id: userId
                })
                .then(user => {
                    if (user.role === 'admin') {
                        if (!ObjectId.isValid(id)) {
                            return res.send(400).send(`No record with given id: ${id}`)
                        }
                        Note.findByIdAndRemove(id, (err, docs) => {
                            const result = {
                                data: docs,
                                message: 'Note has been removed successfully.',
                                status: 200,
                            }

                            if (!err) {
                                res.status(200).send(result)
                            } else {
                                res.status(500).send(err)

                            }
                        })
                    } else {
                        if (userId != note.userId.toString()) {
                            return res.status(401).send(`You are not authorized to delete this record`)
                        } else {
                            if (!ObjectId.isValid(id)) {
                                return res.send(400).send(`No record with given id: ${id}`)
                            }
                            Note.findByIdAndRemove(id, (err, docs) => {
                                const result = {
                                    data: docs,
                                    message: 'Note has been removed successfully.',
                                    status: 200,
                                }

                                if (!err) {
                                    res.status(200).send(result)
                                } else {
                                    res.status(500).send(err)

                                }
                            })
                        }
                    }
                });
        });
}

//count all notes
exports.count = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    console.log(userId);
    //get user's role
    User.findOne({
            _id: userId
        })
        .then(user => {
            if (user.role == 'service') {
                Note.countDocuments({}, (err, count) => {
                    if (!err) {
                        res.status(200).send({
                            success: true,
                            count
                        })
                    } else {
                        res.status(500).send(err)
                    }
                });
            } else {
                Note.countDocuments({
                    userId: userId
                }, (err, count) => {
                    if (!err) {
                        res.status(200).send({
                            success: true,
                            count
                        })
                    } else {
                        res.status(500).send(err)
                    }
                });
            }
        });
}