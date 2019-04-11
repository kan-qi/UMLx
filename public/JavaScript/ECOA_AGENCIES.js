
var ECOA_AGENCIES = {};

ECOA_AGENCIES.name = "ECOA_AGENCIES";              // Model name

ECOA_AGENCIES.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in ECOA_AGENCIES
ECOA_AGENCIES.create = function(data, success, error) {
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

    DBAdapter.create(ECOA_AGENCIES.name, data, successCB, errorCB);
};


// "id" : the ObjectId of ECOA_AGENCIES, must be 24 character hex string 
ECOA_AGENCIES.get = function(id, success, error) {
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

    DBAdapter.get(ECOA_AGENCIES.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
ECOA_AGENCIES.read = function(data, success, error) {
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

    DBAdapter.read(ECOA_AGENCIES.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ECOA_AGENCIES, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
ECOA_AGENCIES.update = function(id, update, success, error) {
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

    DBAdapter.update(ECOA_AGENCIES.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
ECOA_AGENCIES.delete = function(data, success, error) {
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

    DBAdapter.delete(ECOA_AGENCIES.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ECOA_AGENCIES, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in ECOA_AGENCIES
ECOA_AGENCIES.set = function(id, newData, success, error) {
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

    DBAdapter.update(ECOA_AGENCIES.name, data, successCB, errorCB);
};

// Add the other functions here


