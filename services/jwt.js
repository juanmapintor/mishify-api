'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');

const secret = 'clave_secreta_curso';

exports.createToken = function (user) {
    let payload = {
        user: user,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };

    return jwt.encode(payload, secret);
};