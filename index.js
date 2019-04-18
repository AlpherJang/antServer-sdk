'use strict';
const express = require('express');
const bodyPaser = require('body-parser');
const cors = require('cors');
const config = require('./config/config.json');
const router = require('./routes');
global.rootPath = __dirname;

const app = express();
app.options('*', cors());
app.use(bodyPaser.json());
app.use(cors());
router(app);

let server = app.listen(config.server.port || '8080', () => {
    let address = server.address().address == '::' ? 'localhost' : server.address().address == '::';
    let port = server.address().port;
    console.log('server start.........');
    console.log('server address: http://%s:%s', address, port)
});

