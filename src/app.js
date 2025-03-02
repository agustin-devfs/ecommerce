// app.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 8080;

// Conectar a MongoDB
connectDB();

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.set("socketio", io);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Importar rutas
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/cart.router");
const viewsRouter = require("./routes/views");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Websockets
io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Evento para agregar un producto
  socket.on("nuevoProducto", async (producto) => {
    try {
      const Product = require("../models/products.model");
      const newProduct = await Product.create(producto);
      io.emit("actualizarProductos", await Product.find());
    } catch (error) {
      console.error("Error agregando producto:", error);
    }
  });

  // Evento para eliminar un producto
  socket.on("eliminarProducto", async (id) => {
    try {
      const Product = require("../models/products.model");
      await Product.findByIdAndDelete(id);
      io.emit("actualizarProductos", await Product.find());
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

// Iniciar servidor con Socket.io
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
