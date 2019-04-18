'use strict';
const Chain = require('@alipay/mychain/index.node');
const fs = require('fs');
const solc = require('@alipay/solc');
const config = require('../config/config');
const rootPath = buildPath(__dirname, "/../");

function getChain() {
    let accountKey = fs.readFileSync(buildPath(rootPath, config.user.cert), {encoding: config.certCharset});
    let keyInfo = Chain.utils.getKeyInfo(accountKey, config.user.password);
    let opt = {
        host: config.epoint.host,
        port: config.epoint.port,
        timeout: config.timeout,
        cert: fs.readFileSync(buildPath(rootPath, config.client.cert), {encoding: config.certCharset}),
        ca: fs.readFileSync(buildPath(rootPath, config.caCert), {encoding: config.certCharset}),
        key: fs.readFileSync(buildPath(rootPath, config.client.key), {encoding: config.certCharset}),
        userPublicKey: keyInfo.publicKey,
        userPrivateKey: keyInfo.privateKey,
        userRecoverPublicKey: keyInfo.publicKey,
        userRecoverPrivateKey: keyInfo.privateKey,
        passphrase: config.client.passphrass
    };
    let chain = Chain(opt);
    return chain;
}

function getContract(chain, contractName, contractClassName) {
    let contract = fs.readFileSync(buildPath(rootPath, config.contract.path), {encoding: config.contractCharset});
    let output = solc.compile(contract, 1);
    let abi = JSON.parse(output.contracts[':' + contractClassName].interface);
    let myContract = chain.ctr.contract(contractName, abi);
    let bytecode = output.contracts[':' + contractClassName].bytecode;
    return {myContract: myContract, byteCode: bytecode};
}

function buildPath(base, file) {
    return base + file;
}

function errorParams(field) {
    return {
        success: false,
        error: field + ' params is invalid or missing in the request'
    };
}

function success(msg) {
    return {
        success: true,
        error: msg
    };
}

exports.getChain = getChain;
exports.buildPath = buildPath;
exports.getContract = getContract;
exports.errorParams = errorParams;
exports.success = success;
