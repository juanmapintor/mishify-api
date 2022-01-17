'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'clave_secreta_curso';

exports.ensureAuth = function (req, res, next) {
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
    }

    let token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        let payload = jwt.decode(token, secret);

        if(payload.exp >= moment().unix()) {
            return res.status(401).send({message: 'Token expirado'});
        }

        req.user = payload.user;

        next();
    } catch(err) {
        console.error(err);
        return res.status(404).send({message: 'Token no valido'});
    }


}