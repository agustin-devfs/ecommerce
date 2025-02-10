const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../productos.json');

const getProducts = () => {
    if (fs.existsSync(productsFilePath)) {
        const data = fs.readFileSync(productsFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

router.get('/realtimeproducts', (req, res) => {
    const products = getProducts();
    res.render('realTimeProducts', { products });
});

router.get('/', (req, res) => {
    const products = getProducts();
   // console.log("Productos cargados en /:", products);
    res.render('home', { products });
});

module.exports = router;
