'use strict'
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Album = require('../models/album');
const Song = require('../models/song');

async function getAlbum(req, res){
    let albumId = req.params.id;

    if(!ObjectId.isValid(albumId)) return res.status(422).send({message: 'El ID no es válido'});

    try {
        let album = await Album.findById(albumId).populate({path: 'artist'}).exec();

        if(!album) return res.status(404).send({message: 'El album solicitado no existe'});

        return res.status(200).send({album});
    } catch(error) {
        return res.status(500).send({message: 'Error del servidor al intentar obtener el album', error});
    }
}
async function listAlbums(req, res){
    let artistId = req.query.artist;
    let page = req.query.page ? +req.query.page : 1;
    let itemsPerPage = req.query.items_per_page ? +req.query.items_per_page : 3;
    try {
        let albums = 
            await Album.find(artistId ? {artist: artistId} : {})
                       .sort({'year': 'desc'})
                       .populate({path: 'artist'})
                       .paginate(page, itemsPerPage)
                       .exec();
        let total_items = await Album.countDocuments(artistId ? {artist: artistId} : {}).exec()

        if(albums.length === 0) return res.status(200).send({message: 'No hay albumes para mostrar'});
        
        return  res.status(200).send(
            {
                total_items: total_items,
                items_per_page: itemsPerPage,
                albums
            });
    } catch(err) {
        return res.status(500).send({message: 'Error al obtener los albumes', error: err});
    }
}
async function saveAlbum(req, res) {
    let params = req.body;

    let album = new Album();

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = null;
    album.artist = new ObjectId(params.artist);

    try {
        let newAlbum = await album.save();

        if(!newAlbum) return res.status(404).send({ message: 'No se guardo el nuevo album' });

        return res.status(200).send({ album: newAlbum });
    } catch(err) {
        return res.status(500).send({ message: 'Error en el servidor al guardar el album'});
    }
}

async function updateAlbum(req, res){
    let albumId = req.params.id;

    if(!ObjectId.isValid(albumId)) return res.status(422).send({message: 'El ID no es válido'});

    let update = req.body;

    try {
        let albumUpdated = await Album.findByIdAndUpdate(albumId, update).exec();

        if(!albumUpdated) return res.status(404).send({ message: 'No existe el album que quieres actualizar' });

        return res.status(200).send({album: albumUpdated});

    } catch (error) {
        return res.status(500).send({message: 'Falló al actualizar', error});
    }
}

async function deleteAlbum(req, res){
    let albumId = req.params.id;

    if(!ObjectId.isValid(albumId)) return res.status(422).send({message: 'El ID no es válido'});

    try {
        let albumDeleted = await Album.findByIdAndDelete(albumId).exec();

        if(!albumDeleted)  return res.status(404).send({ message: 'No existe el album que quieres eliminar' });

        let songsDeleted = await Song.deleteMany({ album: albumId }).exec();

        return res.status(200).send({ album: albumDeleted, songsDeleted: songsDeleted.deletedCount });

    } catch(error) {

    }

}

function uploadImage(req, res) {
    let albumId = req.params.id;
    let file_name = 'No subido...';

    if(req.files){
        let file_path = req.files.file.path;
        let file_split = file_path.split('\/');
        file_name = file_split[2];

        if(mime.lookup(file_name).startsWith('image')){
            Album.findByIdAndUpdate(albumId, {
                image: file_name
            }, (err, albumUpdated) => {
                if(err){
                    res.status(500).send(
                        {
                            message: 'Error al actualizar el album'
                        }
                    )
                } else {
                    if(!albumUpdated){
                        res.status(404).send(
                            {
                                message: 'No existe el album que quieres actualizar'
                            }
                        )
                    } else {
                        res.status(200).send(
                            {
                                album: albumUpdated
                            }
                        )
                    }
                }
            })
        } else {
            res.status(400).send(
                {
                    message: 'Extension del archivo no valida'
                }
            )
        }

    } else {
        res.status(400).send(
            {
                message: 'No has subido ninguna imagen'
            }
        );
    }
}

function getImageFile(req, res) {
    let imageFile = req.params.imageFile;
    let path_file = './uploads/albums/'+imageFile;


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
    saveAlbum,
    getAlbum,
    listAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}
