// src/routes/cart.router.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart.model');
const Product = require('../models/products.model');

// POST /api/carts - Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/carts/:cid - Obtener los productos de un carrito
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    // Verificar que el producto existe
    const productExists = await Product.findById(pid);
    if (!productExists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Verificar si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
