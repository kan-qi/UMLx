
var WS_CHECKS = {};

WS_CHECKS.name = "WS_CHECKS";              // Model name

WS_CHECKS.attributes = [            // Model attribute list
    "LoanType"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_CHECKS
WS_CHECKS.create = function(data, success, error) {
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

    DBAdapter.create(WS_CHECKS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_CHECKS, must be 24 character hex string 
WS_CHECKS.get = function(id, success, error) {
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

    DBAdapter.get(WS_CHECKS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_CHECKS.read = function(data, success, error) {
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

    DBAdapter.read(WS_CHECKS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_CHECKS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_CHECKS.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_CHECKS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_CHECKS.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_CHECKS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_CHECKS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_CHECKS
WS_CHECKS.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_CHECKS.name, data, successCB, errorCB);
};

// Add the other functions here


