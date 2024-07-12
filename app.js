console.log('Iniciando aplicación...');
require('dotenv').config();
console.log('Variables de entorno cargadas');
const express = require('express');
console.log('Express importado');
// ... resto del código
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

const app = express();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.use(express.json());
app.use('/api/v1/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));