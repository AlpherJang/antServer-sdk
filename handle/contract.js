'use strict';
const fs = require("fs");
const config = require('../config/config');
const utils = require('./utils');
const rootPath = utils.buildPath(__dirname, "/../");
let chain = utils.getChain();
let {myContract, byteCode} = utils.getContract(chain, config.contract.name, config.contract.className);
let rsa2048 = {
    public: fs.readFileSync(utils.buildPath(rootPath, config.rsaPem))
};
let deploy = function (req, res) {

    myContract.new(byteCode, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, contract, data) => {
        console.log("Tee contract deploy result:", data);
        if (!err) {
            res.status(200).json(utils.success("deploy contract successful"))
        } else {
            console.log(err);
            res.status(500).json({success: false, error: err});
        }
    });
};


function store(req, res) {
    const uid = req.body.uid;
    const fileName = req.body.fileName;
    const digest = req.body.digest;
    const owner = req.body.owner;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));
        return;
    }
    if (!fileName) {
        res.status(500).json(utils.errorParams('\'fileName\''));
        return;
    }
    if (!digest) {
        res.status(500).json(utils.errorParams('\'digest\''));
        return;
    }
    if (!owner) {
        res.status(500).json(utils.errorParams('\'owner\''));
        return;
    }
    myContract.Store(uid, fileName, digest, owner, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        console.log("Tee contract output encrypted:", output);
        console.log("Tee contract data encrypted:", data);
        console.log(err);
        console.log(config.contract.aesKey);
        console.log("Tee contract output decrypted:", myContract.getOutput("Store", chain.utils.decryptAESWithPassword(output, config.contract.aesKey, data.txhash)));
        res.status(200).json(utils.success("store success"));
    });
}

function query(req,res){
    const uid = req.body.uid;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));
        return;
    }
    console.log(uid);
    myContract.Query(uid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        console.log("Tee contract output encrypted:", output);
        console.log("Tee contract data encrypted:", data);
        console.log(err);
        console.log(config.contract.aesKey);
        console.log("Tee contract output decrypted:", myContract.getOutput("Query", chain.utils.decryptAESWithPassword(output, config.contract.aesKey, data.txhash)));
        res.status(200).json(utils.success("store success"));
    });
}

exports.deploy = deploy;
exports.store = store;
exports.query=query;
