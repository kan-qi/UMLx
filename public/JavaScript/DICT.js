
var DICT = {};

DICT.name = "DICT";              // Model name

DICT.attributes = [            // Model attribute list
    "Tag"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DICT
DICT.create = function(data, success, error) {
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

    DBAdapter.create(DICT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DICT, must be 24 character hex string 
DICT.get = function(id, success, error) {
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

    DBAdapter.get(DICT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DICT.read = function(data, success, error) {
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

    DBAdapter.read(DICT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DICT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DICT.update = function(id, update, success, error) {
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

    DBAdapter.update(DICT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DICT.delete = function(data, success, error) {
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

    DBAdapter.delete(DICT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DICT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DICT
DICT.set = function(id, newData, success, error) {
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

    DBAdapter.update(DICT.name, data, successCB, errorCB);
};

// Add the other functions here


