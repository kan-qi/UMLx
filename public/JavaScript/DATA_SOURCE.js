
var DATA_SOURCE = {};

DATA_SOURCE.name = "DATA_SOURCE";              // Model name

DATA_SOURCE.attributes = [            // Model attribute list
    "MasterEnable", "EnableDefault", "Type", "Software", "SoftwareDescription", "IdentifierRequired", "LicenseURL", "LicenseId", "LicenseRequired", "ApprovedEnvironments", "AppletFieldsLocked", "Commision", "CallbackURL", "CallbackToken", "CallbackTriggers"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DATA_SOURCE
DATA_SOURCE.create = function(data, success, error) {
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

    DBAdapter.create(DATA_SOURCE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DATA_SOURCE, must be 24 character hex string 
DATA_SOURCE.get = function(id, success, error) {
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

    DBAdapter.get(DATA_SOURCE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DATA_SOURCE.read = function(data, success, error) {
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

    DBAdapter.read(DATA_SOURCE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DATA_SOURCE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DATA_SOURCE.update = function(id, update, success, error) {
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

    DBAdapter.update(DATA_SOURCE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DATA_SOURCE.delete = function(data, success, error) {
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

    DBAdapter.delete(DATA_SOURCE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DATA_SOURCE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DATA_SOURCE
DATA_SOURCE.set = function(id, newData, success, error) {
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

    DBAdapter.update(DATA_SOURCE.name, data, successCB, errorCB);
};

// Add the other functions here


