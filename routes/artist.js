'use strict'

const express = require('express');
const ArtistController = require('../controllers/artist');
const md_auth = require('../middleware/autenticate');

const multiparty = require('connect-multiparty');
const md_upload = multiparty({uploadDir: './uploads/artists'});

const api = express.Router();

api.post('/artist', md_auth.ensureAuth, ArtistController.saveArtist);
api.get('/artists', md_auth.ensureAuth, ArtistController.listArtists);
api.get('/artist/:id', md_auth.ensureAuth, ArtistController.getArtist);
api.put('/artist/:id', md_auth.ensureAuth, ArtistController.updateArtist);
api.delete('/artist/:id', md_auth.ensureAuth, ArtistController.deleteArtist);
api.post('/upload-image-artist/:id', [md_auth.ensureAuth, md_upload], ArtistController.uploadImage);
api.get('/get-image-artist/:imageFile', ArtistController.getImageFile);

module.exports = api;