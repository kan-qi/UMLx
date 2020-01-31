
var FLOOD_CERT_TRANSACTION = {};

FLOOD_CERT_TRANSACTION.name = "FLOOD_CERT_TRANSACTION";              // Model name

FLOOD_CERT_TRANSACTION.attributes = [            // Model attribute list
    "ProviderRequest", "ProviderResponse", "EncodedForm"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FLOOD_CERT_TRANSACTION
FLOOD_CERT_TRANSACTION.create = function(data, success, error) {
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

    DBAdapter.create(FLOOD_CERT_TRANSACTION.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FLOOD_CERT_TRANSACTION, must be 24 character hex string 
FLOOD_CERT_TRANSACTION.get = function(id, success, error) {
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

    DBAdapter.get(FLOOD_CERT_TRANSACTION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FLOOD_CERT_TRANSACTION.read = function(data, success, error) {
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

    DBAdapter.read(FLOOD_CERT_TRANSACTION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_CERT_TRANSACTION, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FLOOD_CERT_TRANSACTION.update = function(id, update, success, error) {
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

    DBAdapter.update(FLOOD_CERT_TRANSACTION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FLOOD_CERT_TRANSACTION.delete = function(data, success, error) {
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

    DBAdapter.delete(FLOOD_CERT_TRANSACTION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_CERT_TRANSACTION, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FLOOD_CERT_TRANSACTION
FLOOD_CERT_TRANSACTION.set = function(id, newData, success, error) {
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

    DBAdapter.update(FLOOD_CERT_TRANSACTION.name, data, successCB, errorCB);
};

// Add the other functions here


