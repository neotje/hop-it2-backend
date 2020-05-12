"use strict";
require('console-stamp')(console, '[HH:MM:ss.l]');

const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const config = require('./config');

//=== Middleware ===//
// cors policy
app.use(cors({
    origin: 'http://localhost:4200',
    allowedOrigins: [
        'http://localhost:9000',
        'http://localhost:4200'
    ]
}));
// session
var sessionMiddleware = session({
    secret: require('shortid')(),
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false },
    maxAge: 24 * 60 * 60 * 1000
})
app.use(sessionMiddleware);
// post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// routers
app.use(config.api.path, require("./routes/api")); // api router
app.use(express.static('/mnt/data/gits/hop-it2-app/dist/hop-it2-app'));

// sockets
const chatSocket = require('./packages/chatmanager');
chatSocket.socket.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
chatSocket.socket.attach(server);

server.listen(config.server.port, () => {
    console.log(`Started hop-it 2.0 server on port ${config.server.port}`);
});
