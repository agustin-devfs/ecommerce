const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Rutas para archivos
const cartsFilePath = path.join(__dirname, '../carrito.json');
const productsFilePath = path.join(__dirname, '../productos.json');

// Función para leer carritos desde el archivo
const readCarts = () => {
    if (!fs.existsSync(cartsFilePath)) return [];
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para guardar carritos en el archivo
const saveCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Función para leer productos desde el archivo
const readProducts = () => {
    if (!fs.existsSync(productsFilePath)) return [];
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Ruta POST / - Crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readCarts();
    const newCart = {
        id: generateCartId(carts),
        products: []
    };

    carts.push(newCart);
    saveCarts(carts);
    res.status(201).json(newCart);
});

// Ruta GET /:cid - Obtener los productos de un carrito
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = readCarts();
    const cart = carts.find(c => c.id === parseInt(cid));

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    return res.json(cart.products);
});

// Ruta POST /:cid/product/:pid - Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = readCarts();
    const products = readProducts();

    // Verificar si el producto existe en el archivo de productos
    const productExists = products.find(p => p.id === parseInt(pid));
    if (!productExists) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar si el carrito existe
    const cart = carts.find(c => c.id === parseInt(cid));
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Buscar si el producto ya está en el carrito
    const existingProduct = cart.products.find(p => p.product === parseInt(pid));
    if (existingProduct) {
        // Incrementar la cantidad si el producto ya existe
        existingProduct.quantity += 1;
    } else {
        // Agregar un nuevo producto con quantity = 1
        cart.products.push({ product: parseInt(pid), quantity: 1 });
    }

    saveCarts(carts);
    res.status(200).json(cart);
});

// Función para generar un ID único para carritos
const generateCartId = (carts) => {
    return carts.length ? Math.max(...carts.map(c => c.id)) + 1 : 1;
};

module.exports = router;
