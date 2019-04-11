
var IMPOUND = {};

IMPOUND.name = "IMPOUND";              // Model name

IMPOUND.attributes = [            // Model attribute list
    "Description", "Payee", "Purpose"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in IMPOUND
IMPOUND.create = function(data, success, error) {
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

    DBAdapter.create(IMPOUND.name, data, successCB, errorCB);
};


// "id" : the ObjectId of IMPOUND, must be 24 character hex string 
IMPOUND.get = function(id, success, error) {
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

    DBAdapter.get(IMPOUND.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
IMPOUND.read = function(data, success, error) {
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

    DBAdapter.read(IMPOUND.name, data, successCB, errorCB);
};

// "id" : the ObjectId of IMPOUND, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
IMPOUND.update = function(id, update, success, error) {
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

    DBAdapter.update(IMPOUND.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
IMPOUND.delete = function(data, success, error) {
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

    DBAdapter.delete(IMPOUND.name, data, successCB, errorCB);
};

// "id" : the ObjectId of IMPOUND, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in IMPOUND
IMPOUND.set = function(id, newData, success, error) {
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

    DBAdapter.update(IMPOUND.name, data, successCB, errorCB);
};

// Add the other functions here


