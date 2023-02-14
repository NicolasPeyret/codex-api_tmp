const colors = require('colors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const {
    Book
} = require('../models/bookModel');
const {
    User
} = require('../models/userModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.index = (req, res) => {
    Book.find((err, docs) => {
        if (!err) {
            const filters = req.query;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, JWT_SECRET);
            const userId = decodedToken.userId;
            User.findOne({
                _id: userId
            })
                .then(user => {
                    //if role is admin and there is no filter
                    if (user.role === 'admin') {
                        if (Object.keys(filters).length === 0 && filters.constructor === Object) {
                            res.status(200).send(docs);
                        } else {
                            const filteredBooks = docs.filter(book => {
                                let querySearch = true;
                                for (key in filters) {
                                    querySearch = book[key] == filters[key];
                                }
                                return querySearch;
                            });
                            if (filteredBooks.length > 0) {
                                res.status(200).send(filteredBooks);
                            } else {
                                res.send(`No record with query given`);
                            }
                        }
                    } else {
                        if (Object.keys(filters).length === 0 && filters.constructor === Object) {
                            res.send(docs.filter(book => book.userId == userId));
                        } else {
                            const filteredBooks = docs.filter(book => {
                                if (book.userId == userId) {
                                    let querySearch = true;
                                    for (key in filters) {
                                        querySearch = book[key] == filters[key];
                                    }
                                    return querySearch;
                                } else {
                                    return false;
                                }
                            });
                            if (filteredBooks.length > 0) {
                                res.status(200).send(filteredBooks);
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
    Book.findOne({
        _id: req.params.id
    })
        .then(book => {
            User.findOne({
                _id: userId
            })
                .then(user => {
                    if (user.role === 'admin') {
                        res.status(200).send(book);
                    } else {
                        if (userId != book.userId.toString()) {
                            return res.status(401).send(`You are not authorized to visualize this record`)
                        } else {
                            try {
                                res.status(200).send(book)
                            } catch (e) {
                                res.status(500).send(e)
                            }
                        }
                    }
                });
        });
};

//Create
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
                const newBook = new Book({
                    isbn: req.body.isbn,
                    userId: selectedUserId,
                    bookMark: req.body.bookMark
                });
                newBook.save((err, docs) => {
                    if (!err) {
                        res.status(201).send(docs)
                    } else {
                        res.status(500).send(err)
                    }
                });
            } else {
                const newBook = new Book({
                    isbn: req.body.isbn,
                    userId: userId,
                    bookMark: req.body.bookMark
                });
                newBook.save((err, docs) => {
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

    Book.findOne({
        _id: req.params.id
    })
        .then(book => {
            User.findOne({
                _id: userId
            })
                .then(user => {
                    if (user.role === 'admin') {
                        let selectedUserId = user._id;
                        if (req.body.userId) {
                            selectedUserId = req.body.userId;
                        }
                        console.log(selectedUserId);
                        Book.findByIdAndUpdate(id, {
                            $set: {
                                isbn: req.body.isbn,
                                userId: selectedUserId,
                                bookMark: req.body.bookMark,
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
                    } else {
                        if (userId != book.userId.toString()) {
                            return res.status(401).send(`You are not authorized to update this record`)
                        } else {

                            if (!ObjectId.isValid(id)) {
                                return res.send(400).send(`No record with given id: ${id}`.green.inverse)
                            }

                            Book.findByIdAndUpdate(id, {
                                $set: {
                                    isbn: req.body.isbn,
                                    userId: userId,
                                    bookMark: req.body.bookMark,
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

    Book.findOne({
        _id: req.params.id
    })
        .then(book => {
            User.findOne({
                _id: userId
            })
                .then(user => {
                    if (user.role === 'admin') {
                        if (!ObjectId.isValid(id)) {
                            return res.send(400).send(`No record with given id: ${id}`)
                        }
                        Book.findByIdAndRemove(id, (err, docs) => {
                            const result = {
                                data: docs,
                                message: 'Book has been removed successfully.',
                                status: 200,
                            }
                            if (!err) {
                                res.status(200).send(result)
                            } else {
                                res.status(500).send(err)

                            }
                        });
                    } else {
                        if (userId != book.userId.toString()) {
                            return res.status(401).send(`You are not authorized to delete this record`)
                        } else {
                            if (!ObjectId.isValid(id)) {
                                return res.send(400).send(`No record with given id: ${id}`)
                            }
                            Book.findByIdAndRemove(id, (err, docs) => {
                                const result = {
                                    data: docs,
                                    message: 'Book has been removed successfully.',
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

//count all books
exports.count = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    //get user's role
    User.findOne({
        _id: userId
    })
        .then(user => {
            if (user.role == 'service') {
                Book.countDocuments({}, (err, count) => {
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
                Book.countDocuments({
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