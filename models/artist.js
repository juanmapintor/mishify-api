'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ArtistSchema = Schema(
    {
        name: String,
        description: String,
        image: String
    }
);

module.exports = mongoose.model('Artist', ArtistSchema);