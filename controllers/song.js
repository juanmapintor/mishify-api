'use strict'
const mime = require('mime-types');

const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Song = require('../models/song');
const Album = require('../models/album');

async function getSong(req, res) {
    let songId = req.params.id;

    if(!ObjectId.isValid(songId)) return res.status(400).send({ message: 'El ID de cancion ingresado no es valido'});

    try {
        let song = await Song
            .findById(songId)
            .populate(
                {
                    path: 'album',
                    populate: {
                        path: 'artist',
                        model: 'Artist'
                    }
                })
            .exec();

        if(!song) return res.status(404).send({message: 'La cancion que que solicitó no existe'});

        return res.status(200).send({song});

    } catch(err) {
        return res.status(500).send({message: 'No se pudo obtener la cancion', error: err});
    }
}
async function updateSong(req, res) {
    let songId = req.params.id;

    if(!ObjectId.isValid(songId)) return res.status(400).send({ message: 'El ID de cancion ingresado no es valido'});

    let params = req.body;

    try {
        let updatedSong = await Song.findByIdAndUpdate(songId, params).exec();

        if(!updateSong) return res.status(404).send({message: 'La cancion que que solicitó no existe'});

        return res.status(200).send({song: updatedSong});
    } catch(error) {
        return res.status(500).send({message: 'No se pudo obtener la cancion', error});
    }

}
async function deleteSong(req, res) {
    let songId = req.params.id;

    if(!ObjectId.isValid(songId)) return res.status(400).send({ message: 'El ID de cancion ingresado no es valido'});

    try {
        let deletedSong = await Song.findByIdAndDelete(songId).exec();

        if(!deletedSong) return res.status(404).send({message: 'La cancion que que solicitó no existe'});

        //Reordenar
        let songsToOrder = await Song.find(
            {
                number: { 
                    $gt: deletedSong.number
                },
                album: deletedSong.album
            }
        ).exec();

        if(songsToOrder.length > 0) {
            for(let song of songsToOrder){
                await Song.findByIdAndUpdate(song._id, {number: song.number - 1}).exec();
            }
        }

        return res.status(200).send({song: deletedSong});

    } catch(error) {
        return res.status(500).send({message: 'No se pudo eliminar la cancion', error});
    }

}
async function listSongs(req, res) {
    let albumId = req.query.album;
    let page = req.query.page ? +req.query.page : 1;
    let itemsPerPage = req.query.items_per_page ? +req.query.items_per_page : 5;

    try {
        let songs = await Song
            .find(albumId ? {album: albumId} : {})
            .sort('number')
            .populate(
                {
                    path: 'album',
                    populate: {
                        path: 'artist',
                        model: 'Artist'
                    }
                })
            .paginate(page, itemsPerPage)
            .exec();

        let total_items = await Song.countDocuments(albumId ? {album: albumId} : {}).exec();

        if(songs.length === 0) return res.status(200).send({message: 'No hay canciones para mostrar'});

        return  res.status(200).send(
            {
                total_items: total_items,
                items_per_page: itemsPerPage,
                songs
            });
    } catch(err) {
        console.error(err);
        return res.status(500).send({message: 'Error al obtener las cancioens', error: err});
    }
}
async function saveSong(req, res) {
    let song = new Song();
    let params = req.body;

    
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;


    try {
        if(!(await Album.findById(song.album))) return res.status(404).send({ message: 'El album asignado a la cancion no existe' });

        let songOrder = await Song.countDocuments({album: song.album}).exec();

        song.number = songOrder + 1;

        let newSong = await song.save();

        if(!newSong)  return res.status(404).send({ message: 'La cancion que que solicitó no se guardo' });

        return res.status(200).send({song: newSong});
    } catch (error) {
        return res.status(500).send({ message: 'No se pudo guardar la cancion', error });
    }
}

async function uploadSongFile(req, res){
    let songId = req.params.id;
    if(!ObjectId.isValid(songId)) return res.status(400).send({ message: 'El ID de cancion ingresado no es valido'});

    let file_name = 'No subido...';

    if(req.files){
        let file_path = req.files.file.path;
        let file_split = file_path.split('\\');
        file_name = file_split[2];


        if(mime.lookup(file_name) === 'audio/mpeg'){
            try {
                let updatedSong = await Song.findByIdAndUpdate(songId, {file: file_name});

                if(!updatedSong) return res.status(404).send({ message: 'No existe la cancion' });

                return res.status(200).send({song: updatedSong});

            } catch(error) {
                return res.status(500).send({ message: 'No se pudo guardar la cancion', error });
            }
        } else {
            return res.status(200).send({message: 'Extension del archivo no valida', file_path});
        }
    } else {
        return res.status(200).send({message: 'No has subido ningun archivo'});
    }
}

async function getSongFile(req, res) {
    let songFile = req.params.songFile;

    let path_file = './uploads/songs/'+songFile;

    let fileExists = fs.existsSync(path_file);

    if(!fileExists) return res.status(200).send({message: 'No existe el archivo de canción'});

    return res.sendFile(path.resolve(path_file));
}

module.exports = {
    saveSong,
    getSong,
    listSongs,
    updateSong,
    deleteSong,
    uploadSongFile,
    getSongFile
}