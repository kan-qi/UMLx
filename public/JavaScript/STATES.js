
var STATES = {};

STATES.name = "STATES";              // Model name

STATES.attributes = [            // Model attribute list
    "State", "Description", "ZipCodeStart", "ZipCodeEnd", "SecurityInstallType"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in STATES
STATES.create = function(data, success, error) {
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

    DBAdapter.create(STATES.name, data, successCB, errorCB);
};


// "id" : the ObjectId of STATES, must be 24 character hex string 
STATES.get = function(id, success, error) {
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

    DBAdapter.get(STATES.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
STATES.read = function(data, success, error) {
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

    DBAdapter.read(STATES.name, data, successCB, errorCB);
};

// "id" : the ObjectId of STATES, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
STATES.update = function(id, update, success, error) {
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

    DBAdapter.update(STATES.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
STATES.delete = function(data, success, error) {
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

    DBAdapter.delete(STATES.name, data, successCB, errorCB);
};

// "id" : the ObjectId of STATES, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in STATES
STATES.set = function(id, newData, success, error) {
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

    DBAdapter.update(STATES.name, data, successCB, errorCB);
};

// Add the other functions here


