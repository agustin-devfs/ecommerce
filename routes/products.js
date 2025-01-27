const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta para el archivo de productos
const productsFilePath = path.join(__dirname, '../productos.json');

// Función para leer los productos desde el archivo
const readProducts = () => {
    if (!fs.existsSync(productsFilePath)) return [];
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para guardar los productos en el archivo
const saveProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Ruta GET /:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const product = products.find(p => p.id === parseInt(pid));
    if (product) {
        return res.json(product);
    }
    return res.status(404).json({ error: 'Producto no encontrado' });
});

// Ruta GET / - Listar productos con opción de límite
router.get('/', (req, res) => {
    const { limit } = req.query;
    const products = readProducts();
    const limitNumber = limit ? parseInt(limit) : products.length;
    return res.json(products.slice(0, limitNumber));
});

// Ruta POST / - Agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    // Validar campos obligatorios
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails.' });
    }

    const products = readProducts();
    const newProduct = {
        id: generateProductId(products),
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
});

// Ruta PUT /:pid - Actualizar un producto
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const updateFields = req.body;
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(pid));

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Evitar que se actualice el ID
    if (updateFields.id) {
        return res.status(400).json({ error: 'No se puede actualizar el ID de un producto.' });
    }

    // Actualizar los campos del producto
    products[productIndex] = {
        ...products[productIndex],
        ...updateFields
    };

    saveProducts(products);
    res.json(products[productIndex]);
});

// Ruta DELETE /:pid - Eliminar un producto
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const newProducts = products.filter(p => p.id !== parseInt(pid));

    if (newProducts.length === products.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    saveProducts(newProducts);
    res.status(204).send(); // Respuesta vacía con código 204
});

// Función para generar un ID único
const generateProductId = (products) => {
    return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

module.exports = router;
