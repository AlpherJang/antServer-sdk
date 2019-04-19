pragma solidity ^0.4.20;

contract SupplyChain {
    string statusCreated = "created";
    string statusMortgaged = "mortgaged";
    string statusClosed = "closed";

    struct File {
        string uid;
        string fileName;
        string digests;
        string owner;
    }

    struct Invoice {
        string uid;
        int256 amount;
        string payDate;
        string seller;
        string buyer;
        string fileUid;
    }

    struct Asset {
        string uid;
        int256 amount;
        int256 balance;
        string status;
        string holder;
        string invoiceUid;
    }

    mapping(string => File) Files;
    mapping(string => Invoice) Invoices;
    string[] private invoiceUidList;
    mapping(string => Asset) Assets;

    function Store(string uid, string fileName, string digests, string owner) public {
        Files[uid] = File(uid, fileName, digests, owner);
    }

    function Query(string uid) public view returns (string retUid, string retFileName, string retDigests, string retOwner){
        require(IsExist(Files[uid].uid), "file not exists");
        File storage file = Files[uid];
        return (file.uid, file.fileName, file.digests, file.owner);
    }

    function Source(string uid, int256 amount, string payDate, string seller, string buyer, string fileUid) public {
        Invoices[uid] = Invoice(uid, amount, payDate, seller, buyer, fileUid);
        invoiceUidList.push(uid);
    }

    function Generate(string uid, int256 amount, string holder, string invoiceUid) public {
        //        require(IsExist(Invoices[invoiceUid].uid));
        require(IsExist(Invoices[invoiceUid].uid), "original not exists");
        Assets[uid] = Asset(uid, amount, amount, statusCreated, holder, invoiceUid);
    }

    function Transfer(string uid, string holder) public {
        require(IsExist(Assets[uid].uid), "asset not exists");
        Asset storage asset = Assets[uid];
        asset.holder = holder;
        Assets[uid] = asset;
    }

    function Divide(string originalUid, string uid, int256 amount, string holder, string invoiceUid) public {
        require(IsExist(Assets[originalUid].uid), "asset not exists");
        Asset storage originalAsset = Assets[originalUid];
        originalAsset.balance = originalAsset.amount - amount;
        Assets[originalUid] = originalAsset;
        Assets[uid] = Asset(uid, amount, amount, statusCreated, holder, invoiceUid);
    }

    function Mortage(string uid) public {
        require(IsExist(Assets[uid].uid), "asset not exists");
        Asset storage asset = Assets[uid];
        asset.status = statusMortgaged;
        Assets[uid] = asset;
    }

    function Close(string uid) public {
        require(IsExist(Assets[uid].uid), "asset not exists");
        Asset storage asset = Assets[uid];
        asset.status = statusClosed;
        Assets[uid] = asset;
    }

    function IsExist(string uid) public pure returns (bool){
        if (bytes(uid).length != 0) {
            return true;
        }
        return false;

    }

}
