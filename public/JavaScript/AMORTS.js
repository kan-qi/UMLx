
var AMORTS = {};

AMORTS.name = "AMORTS";              // Model name

AMORTS.attributes = [            // Model attribute list
    "Supplied"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in AMORTS
AMORTS.create = function(data, success, error) {
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

    DBAdapter.create(AMORTS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of AMORTS, must be 24 character hex string 
AMORTS.get = function(id, success, error) {
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

    DBAdapter.get(AMORTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
AMORTS.read = function(data, success, error) {
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

    DBAdapter.read(AMORTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AMORTS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
AMORTS.update = function(id, update, success, error) {
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

    DBAdapter.update(AMORTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
AMORTS.delete = function(data, success, error) {
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

    DBAdapter.delete(AMORTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AMORTS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in AMORTS
AMORTS.set = function(id, newData, success, error) {
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

    DBAdapter.update(AMORTS.name, data, successCB, errorCB);
};

// Add the other functions here


