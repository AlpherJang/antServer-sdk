'use strict';
const contract = require('../handle/contract');
module.exports = function (app) {
    app.get('/contract/deploy', contract.deploy);

    app.post('/contract/store', contract.store);
    app.post('/contract/query',contract.query);

    app.get('*', (req, res) => {
        res.status(404).json({'success': false, 'error': '404 No Found'});
    });
};
