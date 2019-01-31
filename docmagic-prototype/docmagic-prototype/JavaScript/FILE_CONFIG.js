
var FILE_CONFIG = {};

FILE_CONFIG.name = "FILE_CONFIG";              // Model name

FILE_CONFIG.attributes = [            // Model attribute list
    "FileName", "Description", "Notes", "DefaultAccess", "FilePriority", "Indexes", "PurgeExcludes", "TrackChanges", "OptimisticLocking", "ReplicateToQueue"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FILE_CONFIG
FILE_CONFIG.create = function(data, success, error) {
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

    DBAdapter.create(FILE_CONFIG.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FILE_CONFIG, must be 24 character hex string 
FILE_CONFIG.get = function(id, success, error) {
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

    DBAdapter.get(FILE_CONFIG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FILE_CONFIG.read = function(data, success, error) {
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

    DBAdapter.read(FILE_CONFIG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FILE_CONFIG, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FILE_CONFIG.update = function(id, update, success, error) {
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

    DBAdapter.update(FILE_CONFIG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FILE_CONFIG.delete = function(data, success, error) {
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

    DBAdapter.delete(FILE_CONFIG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FILE_CONFIG, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FILE_CONFIG
FILE_CONFIG.set = function(id, newData, success, error) {
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

    DBAdapter.update(FILE_CONFIG.name, data, successCB, errorCB);
};

// Add the other functions here


