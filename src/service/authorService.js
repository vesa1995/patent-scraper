const mongoose = require('mongoose');
const Author = require("./../model/author")

module.exports = {
    createAuthor: async (name) => {
        const author = new Author({
            _id: new mongoose.Types.ObjectId(),
            name: name
        });
        try {
            return await author.save();
        } catch (error) {
            throw error
        }
    },

    // getAuthor: async (id) => {
    //     // ..
    // }
}