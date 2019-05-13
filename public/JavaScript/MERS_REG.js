
var MERS_REG = {};

MERS_REG.name = "MERS_REG";              // Model name

MERS_REG.attributes = [            // Model attribute list
    "MERSID", "MINNumber"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in MERS_REG
MERS_REG.create = function(data, success, error) {
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

    DBAdapter.create(MERS_REG.name, data, successCB, errorCB);
};


// "id" : the ObjectId of MERS_REG, must be 24 character hex string 
MERS_REG.get = function(id, success, error) {
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

    DBAdapter.get(MERS_REG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
MERS_REG.read = function(data, success, error) {
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

    DBAdapter.read(MERS_REG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MERS_REG, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
MERS_REG.update = function(id, update, success, error) {
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

    DBAdapter.update(MERS_REG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
MERS_REG.delete = function(data, success, error) {
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

    DBAdapter.delete(MERS_REG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MERS_REG, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in MERS_REG
MERS_REG.set = function(id, newData, success, error) {
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

    DBAdapter.update(MERS_REG.name, data, successCB, errorCB);
};

// Add the other functions here


