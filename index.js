'use static'
const mongoose = require("mongoose");
const app = require('./app');
const port = process.env.PORT || 3977;


mongoose.connect('mongodb+srv://admin:admin@cluster0.tffpl.mongodb.net/curso-mean2?retryWrites=true&w=majority', (err, res) => {
   if (err) {
       console.error(err);
   } else {
       console.log('Conectado correctamente');
       app.listen(port, function () {
           console.log(`Servidor del APIRest escuchando en http://localhost:${port}`);
       })
   }
});




