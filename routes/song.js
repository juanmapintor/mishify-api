'use strict'

const express = require('express');
const SongController = require('../controllers/song');
const md_auth = require('../middleware/autenticate');

const multiparty = require('connect-multiparty');
const md_upload = multiparty({uploadDir: './uploads/songs'});

const api = express.Router();

api.post('/song', md_auth.ensureAuth, SongController.saveSong);
api.get('/songs/:album?', md_auth.ensureAuth, SongController.listSongs);
api.get('/song/:id', md_auth.ensureAuth, SongController.getSong);
api.put('/song/:id', md_auth.ensureAuth, SongController.updateSong);
api.delete('/song/:id', md_auth.ensureAuth, SongController.deleteSong);
api.post('/upload-file-song/:id', [md_auth.ensureAuth, md_upload], SongController.uploadSongFile);
api.get('/get-file-song/:songFile', SongController.getSongFile);


module.exports = api;