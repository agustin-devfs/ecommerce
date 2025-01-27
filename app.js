const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8080;

// Importar rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

// Middleware para procesar JSON
app.use(express.json());

// Ruta base
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de ecommerce. Usa /api/products o /api/carts para interactuar.');
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
