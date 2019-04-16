const Chain = require("@alipay/mychain/index.node");
const fs = require("fs");

const accountKey = fs.readFileSync('./certs/user.pem', {encoding: "utf8"});
const accountPassword = "test";
const keyInfo = Chain.utils.getKeyInfo(accountKey, accountPassword);
console.log('private key:', keyInfo.privateKey.toString('hex'));
console.log('public key:', keyInfo.publicKey.toString('hex'));
const passphrase = "test";
let opt = {
    host: '139.196.136.94',    //目标区块链网络节点的 IP
    port: 18130,          //端口号
    timeout: 30000,       //连接超时时间配置
    cert: fs.readFileSync("./certs/client.crt", {encoding: "utf8"}),
    ca: fs.readFileSync("./certs/ca.crt", {encoding: "utf8"}),
    key: fs.readFileSync("./certs/client.key", {encoding: "utf8"}),
    userPublicKey: keyInfo.publicKey,
    userPrivateKey: keyInfo.privateKey,
    userRecoverPublicKey: keyInfo.publicKey,
    userRecoverPrivateKey: keyInfo.privateKey,
    passphrase: passphrase
};

//初始化一个连接实例
const chain = Chain(opt);

//调用 API 查询最新的一个区块数据
chain.ctr.QueryLastBlock({}, (err, data) => {
    console.log('raw data:', data);                                     //区块结构数据
    console.log('block hash:', data.block.block_header.hash);             //区块哈希
    console.log('block number:', data.block.block_header.block_number); //区块高度
});
