'use strict';
const contract = require('../handle/contract');
require('console-color-mr');
module.exports = function (app) {
    app.get('/contract/deploy', [logInfo, contract.deploy]);
    app.get('/contract/update', [logInfo, contract.update]);

    app.post('/supplychain/store', [logInfo, contract.store]);
    app.get('/supplychain/query/:uid', [logInfo, contract.query]);
    app.post('/supplychain/source', [logInfo, contract.source]);
    app.post('/supplychain/generate', [logInfo, contract.generate]);
    app.post('/supplychain/transfer', [logInfo, contract.transfer]);
    app.post('/supplychain/divide', [logInfo, contract.divide]);
    app.post('/supplychain/mortage', [logInfo, contract.mortage]);
    app.post('/supplychain/close', [logInfo, contract.close]);

    app.get('*', (req, res) => {
        res.status(404).json({'success': false, 'error': '404 No Found'});
    });
};


function logInfo(req, res, next) {
    let now = new Date();
    console.info("===============================================================");
    console.log("[%s]a request entered: ", now.toUTCString().blue, JSON.stringify({
        path: req.path,
        params: req.params,
        from: req.ip
    }).yellow);
    next();
}
