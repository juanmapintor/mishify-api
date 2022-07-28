'use strict'
const mime = require('mime-types');

const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');

function saveUser(req, res){
    let user = new User();
    let params = req.body;

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.imagen = null;

    if(params.password) {
        bcrypt.hash(params.password, null, null,
            function (err, hash) {
                user.password = hash;
                if(user.name != null && user.surname != null && user.email != null){
                    //Guardar el usuario
                    user.save((err, userStored) => {
                        if(err){
                            res.status(500).send({message: 'Error al guardar el usuario'});
                        } else {
                            if(!userStored){
                                res.status(404).send({message: 'No se ha guardado el usuario' });
                            } else {
                                res.status(200).send({user: userStored});
                            }
                        }
                    })
                } else {
                    res.status(200).send({message: 'Rellena todos los campos'});
                }
            }
        );
    } else {
        res.status(200).send({message: 'Introduce una contraseña'});
    }
}

function loginUser(req, res){
    let params = req.body;

    let email = params.email;
    let password = params.password;

    User.findOne(
        { email: email.toLowerCase() },
        (err, user) => {
            if(err) {
                req.status(500).send({message: 'Error en la petición'});
            } else {
                if(!user){
                    res.status(404).send({message: 'Usuario no existe' });
                } else {
                    //Comprobar la contraseña
                    bcrypt.compare(password, user.password,
                    function(err, check){
                        if(check) {
                            if(params.gethash){
                                let token = jwt.createToken(user);
                                //devolver token jwt
                                res.status(200).send({
                                    token: token
                                })
                            } else {
                                res.status(200).send({user});
                            }
                        } else {
                            res.status(404).send({message: 'Usuario no ha podido logearse' });
                        }
                    })
                }
            }
        }
    )
}

function updateUser(req, res) {
    let userId = req.params.id;
    let update = req.body;

    if(req.user._id != userId){
        res.status(400).send(
            {
                message: 'No autorizado a modificar el usuario'
            }
        );
    } else {
        User.findByIdAndUpdate(userId, update,
            (err, userUpdated) => {
            if(err){
                res.status(500).send(
                    {
                        message: 'Error al actualizar el usuario'
                    }
                )
            } else {
                if(!userUpdated){
                    res.status(404).send(
                        {
                            message: 'No se ha podido actualizar el usuario'
                        }
                    )
                } else {
                    res.status(200).send(
                        {
                            user: userUpdated
                        }
                    )
                }
            }
        });
    }


}

function uploadImage(req, res) {
    let userId = req.params.id;
    let file_name = 'No subido...';

    if(req.files){
        let file_path = req.files.file.path;
        let file_split = file_path.split('\/');
        file_name = file_split[2];

        if(mime.lookup(file_name).startsWith('image')){
            User.findByIdAndUpdate(userId, {
                image: file_name
            }, (err, userUpdated) => {
                if(err){
                    res.status(500).send(
                        {
                            message: 'Error al actualizar el usuario'
                        }
                    )
                } else {
                    if(!userUpdated){
                        res.status(404).send(
                            {
                                message: 'No se ha podido actualizar el usuario'
                            }
                        )
                    } else {
                        res.status(200).send(
                            {
                                image: file_name,
                                user: userUpdated
                            }
                        )
                    }
                }
            })
        } else {
            res.status(200).send(
                {
                    message: 'Extension del archivo no valida'
                }
            )
        }

    } else {
        res.status(200).send(
            {
                message: 'No has subido ninguna imagen'
            }
        );
    }
}

function getImageFile(req, res) {
    let imageFile = req.params.imageFile;
    let path_file = './uploads/users/'+imageFile;
    fs.exists(path_file,function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send(
                {
                    message: 'No existe la imagen'
                }
            )
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
}