'use strict'

const express = require('express');
const UserController = require('../controllers/user');
const md_auth = require('../middleware/autenticate');
const multiparty = require('connect-multiparty');
const md_upload = multiparty({uploadDir: './uploads/users'});

const api = express.Router();

api.get('/prueba-controlador', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.put('/update-user/:id', md_auth.ensureAuth,UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);


module.exports = api;