
var CLOSING_DO = {};

CLOSING_DO.name = "CLOSING_DO";              // Model name

CLOSING_DO.attributes = [            // Model attribute list
    "Account", "Condition"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CLOSING_DO
CLOSING_DO.create = function(data, success, error) {
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

    DBAdapter.create(CLOSING_DO.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CLOSING_DO, must be 24 character hex string 
CLOSING_DO.get = function(id, success, error) {
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

    DBAdapter.get(CLOSING_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CLOSING_DO.read = function(data, success, error) {
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

    DBAdapter.read(CLOSING_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CLOSING_DO, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CLOSING_DO.update = function(id, update, success, error) {
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

    DBAdapter.update(CLOSING_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CLOSING_DO.delete = function(data, success, error) {
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

    DBAdapter.delete(CLOSING_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CLOSING_DO, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CLOSING_DO
CLOSING_DO.set = function(id, newData, success, error) {
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

    DBAdapter.update(CLOSING_DO.name, data, successCB, errorCB);
};

// Add the other functions here


