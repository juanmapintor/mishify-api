'use strict'

const express = require('express');
const AlbumController = require('../controllers/album');
const md_auth = require('../middleware/autenticate');

const multiparty = require('connect-multiparty');
const md_upload = multiparty({ uploadDir: './uploads/albums' });

const api = express.Router();

api.post('/album', md_auth.ensureAuth, AlbumController.saveAlbum);
api.get('/albums/:artist?', md_auth.ensureAuth, AlbumController.listAlbums);
api.get('/album/:id', md_auth.ensureAuth, AlbumController.getAlbum);
api.put('/album/:id', md_auth.ensureAuth, AlbumController.updateAlbum);
api.delete('/album/:id', md_auth.ensureAuth, AlbumController.deleteAlbum);
api.post('/upload-image-album/:id', [md_auth.ensureAuth, md_upload], AlbumController.uploadImage);
api.get('/get-image-album/:imageFile', AlbumController.getImageFile);


module.exports = api;