'use strict'
const mime = require('mime-types');

const fs = require('fs');
const path = require('path');
const mongoosePagination = require('mongoose-pagination');
const mongoose = require("mongoose");

const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');
const User = require("../models/user");


function getArtist(req, res) {
    let artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if(err){
            res.status(500).send({
                message: 'Error en la petición'
            })
        } else {
            if(!artist){
                res.status(404).send({
                    message: 'El artista no existe'
                })
            } else {
                res.status(200).send({artist})
            }
        }
    })
}

function saveArtist(req, res){
    let artist = new Artist();

    let params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = null;

    artist.save((err, artistStored) => {
        if(err) {
            res.status(500).send({
                message: 'Error al guardar el artista'
            })
        } else {
            if(!artistStored){
                res.status(404).send({
                    message: 'El artista no ha sido guardado'
                })
            } else {
                res.status(200).send({
                    artist: artistStored
                })
            }
        }
    })
}

function listArtists(req, res) {
    let page = req.query.page ? +req.query.page : 1;
    let itemsPerPage = req.query.items_per_page ? +req.query.items_per_page : 3;
    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
        if(err){
            res.status(500).send({
                message: 'Error en la peticion'
            })
        } else {
            if(!artists){
                res.status(404).send({
                    message: 'No hay artistas'
                })
            } else {
                res.status(200).send({
                    total_items: total,
                    items_per_page: itemsPerPage,
                    artists: artists
                })
            }
        }
    }  );
}
function updateArtist(req, res) {
    let artistId = req.params.id;
    let update = req.body;

    Artist.findByIdAndUpdate(artistId, update,
        (err, artistUpdated) => {
            if(err){
                res.status(500).send(
                    {
                        message: 'Error al actualizar el artista'
                    }
                )
            } else {
                if(!artistUpdated){
                    res.status(404).send(
                        {
                            message: 'No se ha podido actualizar el artista'
                        }
                    )
                } else {
                    res.status(200).send(
                        {
                            artist: artistUpdated
                        }
                    )
                }
            }
        });
}

async function deleteArtist(req, res){
    let artistId = req.params.id;

    try {
        let deletedArtist = await Artist.findByIdAndDelete(artistId).exec();

        if(!deletedArtist) return res.status(404).send({message: 'No existe el artista'});

        let albumsToDelete = await Album.find({artist: deletedArtist._id}).exec();

        if(albumsToDelete.length === 0){
            return res.status(200).send({ deletedArtist, message: 'El artista no tenia albumes asociados' });
        } else {
            let deletedAlbums = (await Album.deleteMany({artist: deletedArtist._id}).exec()).deletedCount;

            if(deletedAlbums === 0) return res.status(200).send({deletedArtist, message: 'Falló al eliminar los albumes asociados al artista'});

            let deletedSongs = 0;

            for (const album of albumsToDelete) {
               deletedSongs += (await Song.deleteMany({ album: album._id }).exec()).deletedCount;
            }

            return res.status(200).send({deletedArtist, deletedAlbums, deletedSongs});

        }
    } catch (err) {
        return res.status(500).send({message: 'No se pudo eliminar el artista'});
    }
}


function uploadImage(req, res) {
    let artistId = req.params.id;
    let file_name = 'No subido...';

    if(req.files){
        let file_path = req.files.file.path;
        let file_split = file_path.split('\/');
        let file_name = file_split[2];

        if(mime.lookup(file_name).startsWith('image')){
            Artist.findByIdAndUpdate(artistId, {
                image: file_name
            }, (err, artistUpdated) => {
                if(err){
                    res.status(500).send(
                        {
                            message: 'Error al actualizar el artista'
                        }
                    )
                } else {
                    if(!artistUpdated){
                        res.status(404).send(
                            {
                                message: 'No se ha podido actualizar el artista'
                            }
                        )
                    } else {
                        res.status(200).send(
                            {
                                artist: artistUpdated
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
    let path_file = './uploads/artists/'+imageFile;
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
    getArtist,
    saveArtist,
    listArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}