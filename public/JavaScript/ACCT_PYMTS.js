
var ACCT_PYMTS = {};

ACCT_PYMTS.name = "ACCT_PYMTS";              // Model name

ACCT_PYMTS.attributes = [            // Model attribute list
    "CheckID", "CheckNo", "CheckDate", "EntryDate", "CheckAmt", "DepositID", "ImmediateDeposit"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in ACCT_PYMTS
ACCT_PYMTS.create = function(data, success, error) {
    // Wrap data

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.create(ACCT_PYMTS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of ACCT_PYMTS, must be 24 character hex string 
ACCT_PYMTS.get = function(id, success, error) {
    // Wrap data
    var data = id;

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.get(ACCT_PYMTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
ACCT_PYMTS.read = function(data, success, error) {
    // Wrap data

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.read(ACCT_PYMTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ACCT_PYMTS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
ACCT_PYMTS.update = function(id, update, success, error) {
    // Wrap data
    var data = {
        "_id" : id,
        "newData" : update
    };

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.update(ACCT_PYMTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
ACCT_PYMTS.delete = function(data, success, error) {
    // Wrap data 

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.delete(ACCT_PYMTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ACCT_PYMTS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in ACCT_PYMTS
ACCT_PYMTS.set = function(id, newData, success, error) {
    // Wrap data
    var data = {"_id" : id, "newData" : newData};

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.update(ACCT_PYMTS.name, data, successCB, errorCB);
};

// Add the other functions here


