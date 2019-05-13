
var VENDOR_SERVICE = {};

VENDOR_SERVICE.name = "VENDOR_SERVICE";              // Model name

VENDOR_SERVICE.attributes = [            // Model attribute list
    "Provider", "Permission", "AllOnBehalfAllowed"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in VENDOR_SERVICE
VENDOR_SERVICE.create = function(data, success, error) {
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

    DBAdapter.create(VENDOR_SERVICE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of VENDOR_SERVICE, must be 24 character hex string 
VENDOR_SERVICE.get = function(id, success, error) {
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

    DBAdapter.get(VENDOR_SERVICE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
VENDOR_SERVICE.read = function(data, success, error) {
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

    DBAdapter.read(VENDOR_SERVICE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of VENDOR_SERVICE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
VENDOR_SERVICE.update = function(id, update, success, error) {
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

    DBAdapter.update(VENDOR_SERVICE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
VENDOR_SERVICE.delete = function(data, success, error) {
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

    DBAdapter.delete(VENDOR_SERVICE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of VENDOR_SERVICE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in VENDOR_SERVICE
VENDOR_SERVICE.set = function(id, newData, success, error) {
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

    DBAdapter.update(VENDOR_SERVICE.name, data, successCB, errorCB);
};

// Add the other functions here


