const express = require("express");
const router = express.Router();
const Product = require("../models/products.model");
const Cart = require("../models/cart.model");

// 1) GET "/" -> Renderiza home.handlebars con un listado simple de productos
// Ruta para visualizar la lista de productos en la raíz "/"
router.get('/', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const limitNumber = limit ? parseInt(limit) : 10;
    const pageNumber = page ? parseInt(page) : 1;

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

    let sortOption = {};
    if (sort) {
      sortOption.price = sort.toLowerCase() === 'asc' ? 1 : -1;
    }

    const options = {
      page: pageNumber,
      limit: limitNumber,
      sort: sortOption,
      lean: true
    };

    const result = await Product.paginate(filter, options);

    res.render('index', {
      title: 'Lista de Productos',
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/?limit=${limitNumber}&page=${result.prevPage}&sort=${sort || ''}&query=${query || ''}` : null,
      nextLink: result.hasNextPage ? `/?limit=${limitNumber}&page=${result.nextPage}&sort=${sort || ''}&query=${query || ''}` : null
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 2) GET "/realtimeproducts" -> Renderiza la vista con WebSockets
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Productos en Tiempo Real" });
});

// 3) GET "/products" -> Lista de productos con paginación, orden, filtro, etc. Renderiza "index.handlebars"
router.get("/products", async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const limitNumber = limit ? parseInt(limit) : 10;
    const pageNumber = page ? parseInt(page) : 1;

    let filter = {};
    if (query) {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery === "available" || lowerQuery === "disponible") {
        filter.stock = { $gt: 0 };
      } else if (lowerQuery === "notavailable" || lowerQuery === "no-disponible") {
        filter.stock = { $eq: 0 };
      } else {
        filter.category = query;
      }
    }

    let sortOption = {};
    if (sort) {
      sortOption.price = sort.toLowerCase() === "asc" ? 1 : -1;
    }

    const options = {
      page: pageNumber,
      limit: limitNumber,
      sort: sortOption,
      lean: true // importante para poder iterar en handlebars
    };

    const result = await Product.paginate(filter, options);

    res.render("index", {
      title: "Lista de Productos",
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/products?limit=${limitNumber}&page=${result.prevPage}&sort=${sort || ""}&query=${query || ""}`
        : null,
      nextLink: result.hasNextPage
        ? `/products?limit=${limitNumber}&page=${result.nextPage}&sort=${sort || ""}&query=${query || ""}`
        : null
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 4) GET "/products/:pid" -> Detalle de un producto. Renderiza "productDetail.handlebars"
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid).lean();
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    res.render("productDetail", {
      title: product.title,
      product
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 5) GET "/carts/:cid" -> Vista de un carrito. Renderiza "cart.handlebars"
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate("products.product").lean();
    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }
    // Pasamos el carrito completo para que la vista pueda mostrarlo
    res.render("cart", { title: "Detalle del Carrito", cart });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.get('/carts', async (req, res) => {
  try {
    let cart = await Cart.findOne();
    if (!cart) {
      // Crea un carrito vacío si no existe ninguno
      cart = await Cart.create({ products: [] });
    }
    res.render('cart', { cart });
  } catch (error) {
    res.status(500).send('Error al cargar el carrito');
  }
});

module.exports = router;
