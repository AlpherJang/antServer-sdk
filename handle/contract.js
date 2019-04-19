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
let deploy = function (req, res, next) {
    myContract.new(byteCode, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, contract, data) => {
        if (!err) {
            res.status(200).json(utils.success("deploy contract successful"))
        } else {
            console.log("error info:", err);
            res.status(500).json({success: false, error: err});
        }
    });

};

function update(req, res, next) {
    chain.ctr.QueryLastBlock({}, (err, data) => {
        if (err) {
            res.status(500).json(utils.errorInfo(err));

            return;
        } else {
            let blockNumber = data.block.block_header.block_number - 5;
            let {newContract, newByteCode} = utils.getUpdateContract(chain, config.contract.name + Date.now(), config.contract.className);
            newContract.new(newByteCode, {
                from: config.chainUser,
                local: true,
                block_number: blockNumber,
                encrypt: true,
                rsaPublicKey: rsa2048.public,
                aesKey: config.contract.aesKey
            }, (err, contract, data) => {
                let tmpByteCode = chain.utils.decryptAESWithPassword(data.receipt.output, config.contract.aesKey, data.hash);
                myContract.update(tmpByteCode.replace('0x' + chain.EVM, ''), {
                    from: config.chainUser,
                    encrypt: true,
                    rsaPublicKey: rsa2048.public,
                    aesKey: config.contract.aesKey
                }, (err, contract, data) => {
                    if (!err) {
                        res.status(200).json(utils.success("deploy update successful"))
                    } else {
                        console.log("error info:", err);
                        res.status(500).json({success: false, error: err});
                    }
                })
            });
        }
    });

}

function store(req, res, next) {
    let uid = req.body.uid;
    let fileName = req.body.fileName;
    let digest = req.body.digest;
    let owner = req.body.owner;
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
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("store success"));
        }
    });

}

function query(req, res, next) {
    let uid = req.params.uid;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    myContract.Query(uid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("file not exists"));
            }

        } else {
            let decodeOutput = chain.utils.decryptAESWithPassword(data.receipt.output, config.contract.aesKey, data.txhash);
            let result = myContract.getOutput("Query", decodeOutput);
            let file = {uid: result[0], fileName: result[1], digest: result[2], owner: result[3]};
            res.status(200).json(utils.success("store success", file));
        }
    });
}

function source(req, res, next) {
    let uid = req.body.uid;
    let amount = parseInt(req.body.amount);
    let payDate = req.body.payDate;
    let seller = req.body.seller;
    let buyer = req.body.buyer;
    let fileUid = req.body.fileUid;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    if (!amount) {
        res.status(500).json(utils.errorParams('\'amount\''));

        return;
    }
    if (!payDate) {
        res.status(500).json(utils.errorParams('\'payDate\''));

        return;
    }
    if (!seller) {
        res.status(500).json(utils.errorParams('\'seller\''));

        return;
    }
    if (!buyer) {
        res.status(500).json(utils.errorParams('\'buyer\''));

        return;
    }
    if (!fileUid) {
        res.status(500).json(utils.errorParams('\'fileUid\''));

        return;
    }
    myContract.Source(uid, amount, payDate, seller, buyer, fileUid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("source success"));
        }
    });

}

function generate(req, res, next) {
    let uid = req.body.uid;
    let amount = parseInt(req.body.amount);
    let holder = req.body.holder;
    let invoiceUid = req.body.invoiceUid;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    if (!amount) {
        res.status(500).json(utils.errorParams('\'amount\''));

        return;
    }
    if (!holder) {
        res.status(500).json(utils.errorParams('\'holder\''));

        return;
    }
    if (!invoiceUid) {
        res.status(500).json(utils.errorParams('\'fileUid\''));

        return;
    }
    myContract.Generate(uid, amount, holder, invoiceUid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("generate success"));
        }
    });

}

function transfer(req, res, next) {
    let uid = req.body.uid;
    let holder = req.body.holder;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    if (!holder) {
        res.status(500).json(utils.errorParams('\'holder\''));

        return;
    }
    myContract.Transfer(uid, holder, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("transfer success"));
        }
    });

}

function divide(req, res, next) {
    let originalUid = req.body.originalUid;
    let uid = req.body.uid;
    let amount = parseInt(req.body.amount);
    let holder = req.body.holder;
    let invoiceUid = req.body.invoiceUid;
    if (!originalUid) {
        res.status(500).json(utils.errorParams('\'originalUid\''));

        return;
    }
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    if (!amount) {
        res.status(500).json(utils.errorParams('\'amount\''));

        return;
    }
    if (!holder) {
        res.status(500).json(utils.errorParams('\'holder\''));

        return;
    }
    if (!invoiceUid) {
        res.status(500).json(utils.errorParams('\'fileUid\''));

        return;
    }
    myContract.Divide(originalUid, uid, amount, holder, invoiceUid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("divide success"));
        }
    });

}

function mortage(req, res, next) {
    let uid = req.body.uid;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    myContract.Mortage(uid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("mortage success"));
        }
    });

}

function close(req, res, next) {
    let uid = req.body.uid;
    if (!uid) {
        res.status(500).json(utils.errorParams('\'uid\''));

        return;
    }
    myContract.Close(uid, {
        from: config.chainUser,
        encrypt: true,
        rsaPublicKey: rsa2048.public,
        aesKey: config.contract.aesKey
    }, (err, output, data) => {
        if (err || data.receipt.result != 0) {
            if (err) {
                console.log("error info:", JSON.stringify(err));
                res.status(500).json(utils.errorInfo(err));
            } else {
                console.log("receipt info:", JSON.stringify(data.receipt));
                res.status(500).json(utils.errorInfo("there are some error with data"));
            }
        } else {
            res.status(200).json(utils.success("close success"));
        }
    });

}

exports.deploy = deploy;
exports.update = update;
exports.store = store;
exports.query = query;
exports.source = source;
exports.generate = generate;
exports.transfer = transfer;
exports.divide = divide;
exports.mortage = mortage;
exports.close = close;
