
var REPORT_CONFIG = {};

REPORT_CONFIG.name = "REPORT_CONFIG";              // Model name

REPORT_CONFIG.attributes = [            // Model attribute list
    "Config", "File"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in REPORT_CONFIG
REPORT_CONFIG.create = function(data, success, error) {
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

    DBAdapter.create(REPORT_CONFIG.name, data, successCB, errorCB);
};


// "id" : the ObjectId of REPORT_CONFIG, must be 24 character hex string 
REPORT_CONFIG.get = function(id, success, error) {
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

    DBAdapter.get(REPORT_CONFIG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
REPORT_CONFIG.read = function(data, success, error) {
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

    DBAdapter.read(REPORT_CONFIG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REPORT_CONFIG, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
REPORT_CONFIG.update = function(id, update, success, error) {
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

    DBAdapter.update(REPORT_CONFIG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
REPORT_CONFIG.delete = function(data, success, error) {
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

    DBAdapter.delete(REPORT_CONFIG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REPORT_CONFIG, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in REPORT_CONFIG
REPORT_CONFIG.set = function(id, newData, success, error) {
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

    DBAdapter.update(REPORT_CONFIG.name, data, successCB, errorCB);
};

// Add the other functions here


