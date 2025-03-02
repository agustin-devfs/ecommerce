// src/seed/products.seed.js
const connectDB = require("../config/db");
const Product = require("../models/products.model");

const seedProducts = async () => {
  try {
    await connectDB();
    console.log("Conexión establecida para sembrar productos.");

    // Datos de ejemplo para una distribuidora de frutos secos
    const products = [
      {
        title: "Almendras Crudas",
        description:
          "Almendras de alta calidad, perfectas para snacks y repostería.",
        code: "ACR-001",
        price: 1500.5,
        stock: 100,
        category: "Frutos Secos",
        thumbnails: ["https://pycarmenia.com/wp-content/uploads/2020/01/047-1.jpg"],
      },
      {
        title: "Nueces de Castilla",
        description:
          "Nueces de Castilla frescas y crujientes, ideales para ensaladas y postres.",
        code: "NCT-002",
        price: 1800.0,
        stock: 80,
        category: "Frutos Secos",
        thumbnails: ["https://cerezasdiana.com/wp-content/uploads/2020/08/nuez-de-castilla-1200x480.jpeg"],
      },
      {
        title: "Pistachos Naturales",
        description:
          "Pistachos naturales sin sal añadida, perfectos para dietas saludables.",
        code: "PNA-003",
        price: 820.75,
        stock: 60,
        category: "Frutos Secos",
        thumbnails: ["https://upload.wikimedia.org/wikipedia/commons/b/b5/Pistachio_vera.jpg"],
      },
      {
        title: "Mani Tostados",
        description:
          "Mani tostados con un toque de sal, ideales para picar.",
        code: "CTO-004",
        price: 500.0,
        stock: 150,
        category: "Frutos Secos",
        thumbnails: ["https://upload.wikimedia.org/wikipedia/commons/8/88/Peanuts.jpg"],
      },
      {
        title: "Avellanas Premium",
        description:
          "Avellanas de alta calidad, perfectas para chocolatería y postres gourmet.",
        code: "APM-005",
        price: 250.0,
        stock: 70,
        category: "Frutos Secos",
        thumbnails: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Hazelnuts_%28Corylus_avellana%29.jpg/1280px-Hazelnuts_%28Corylus_avellana%29.jpg"],
      },
      {
        title: "Anacardos Seleccionados",
        description:
          "Anacardos crujientes y sabrosos, ideales para snacks y recetas.",
        code: "ANS-006",
        price: 500.0,
        stock: 90,
        category: "Frutos Secos",
        thumbnails: ["https://menjasa.es/revista/wp-content/uploads/2021/02/anacardos.jpg"],
      },
      {
        title: "Semillas de Girasol",
        description:
          "Semillas de girasol naturales, ricas en nutrientes y perfectas para ensaladas.",
        code: "SGN-007",
        price: 800.5,
        stock: 200,
        category: "Semillas y Frutos Secos",
        thumbnails: ["https://i.blogs.es/c63741/pipas-mano/450_1000.jpg"],
      },
      {
        title: "Semillas de Calabaza",
        description:
          "Semillas de calabaza sin sal, ideales para recetas saludables.",
        code: "SCA-008",
        price: 900.0,
        stock: 180,
        category: "Semillas y Frutos Secos",
        thumbnails: ["https://magefesa.com/wp-content/uploads/2021/04/Magefesa_semillascalabaza.jpg"],
      },
    ];

   
   await Product.deleteMany({});
    console.log("Colección de productos limpiada (opcional).");

    const inserted = await Product.insertMany(products);
    console.log(`${inserted.length} productos insertados exitosamente.`);

    process.exit();
  } catch (error) {
    console.error("Error al sembrar productos:", error);
    process.exit(1);
  }
};

seedProducts();
