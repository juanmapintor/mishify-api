'use static'
const mongoose = require("mongoose");
const app = require('./app');
const port = process.env.PORT || 3977;


mongoose.connect('mongodb://localhost:27017/curso-mean2', (err, res) => {
   if (err) {
       console.error(err);
   } else {
       console.log('Conectado correctamente');
       app.listen(port, function () {
           console.log(`Servidor del APIRest escuchando en http://localhost:${port}`);
       })
   }
});




