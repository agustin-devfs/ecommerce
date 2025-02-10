const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 8080;

// Funciones para manejar productos
const productsFilePath = path.join(__dirname, 'productos.json');

const readProducts = () => {
    if (!fs.existsSync(productsFilePath)) return [];
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

const saveProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

const generateProductId = (products) => {
    return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.set('socketio', io);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Importar rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views'); 

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Websockets
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    // Evento para agregar un producto
    socket.on('nuevoProducto', (producto) => {
        const products = readProducts();
        const newProduct = {
            id: generateProductId(products),
            ...producto
        };

        products.push(newProduct);
        saveProducts(products);

        io.emit('actualizarProductos', readProducts()); // Enviar actualización a todos los clientes
    });

    // Evento para eliminar un producto
    socket.on('eliminarProducto', (id) => {
        let products = readProducts();
        products = products.filter(p => p.id !== parseInt(id));
        saveProducts(products);

        io.emit('actualizarProductos', readProducts()); // Enviar actualización a todos los clientes
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Iniciar servidor con Socket.io
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
