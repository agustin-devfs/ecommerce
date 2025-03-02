const express = require('express');
const router = express.Router();
const Product = require('../models/products.model');

// GET /api/products - Listar productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const limitNumber = limit ? parseInt(limit) : 10;
    const pageNumber = page ? parseInt(page) : 1;
    
    // Construir filtro según query
    let filter = {};
    if (query) {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery === 'available' || lowerQuery === 'disponible') {
        filter.stock = { $gt: 0 };
      } else if (lowerQuery === 'notavailable' || lowerQuery === 'no-disponible') {
        filter.stock = { $eq: 0 };
      } else {
        filter.category = query;
      }
    }

    // Configurar ordenamiento
    let sortOption = {};
    if (sort) {
      sortOption.price = sort.toLowerCase() === 'asc' ? 1 : -1;
    }

    const options = {
      page: pageNumber,
      limit: limitNumber,
      sort: sortOption
    };

    const result = await Product.paginate(filter, options);

    // Construir links para la paginación
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const prevLink = result.hasPrevPage
      ? `${baseUrl}?limit=${limitNumber}&page=${result.prevPage}&sort=${sort || ''}&query=${query || ''}`
      : null;
    const nextLink = result.hasNextPage
      ? `${baseUrl}?limit=${limitNumber}&page=${result.nextPage}&sort=${sort || ''}&query=${query || ''}`
      : null;

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Agregar un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails.' });
    }
    const newProduct = await Product.create({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    });

    // Emitir evento para actualizar la lista en tiempo real
    const io = req.app.get('socketio');
    io.emit('actualizarProductos', await Product.find());

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:pid - Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(pid);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Emitir evento para actualizar la lista en tiempo real
    const io = req.app.get('socketio');
    io.emit('actualizarProductos', await Product.find());

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
