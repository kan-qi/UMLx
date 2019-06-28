
var UVLogs = {};

UVLogs.name = "UVLogs";              // Model name

UVLogs.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in UVLogs
UVLogs.create = function(data, success, error) {
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

    DBAdapter.create(UVLogs.name, data, successCB, errorCB);
};


// "id" : the ObjectId of UVLogs, must be 24 character hex string 
UVLogs.get = function(id, success, error) {
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

    DBAdapter.get(UVLogs.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
UVLogs.read = function(data, success, error) {
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

    DBAdapter.read(UVLogs.name, data, successCB, errorCB);
};

// "id" : the ObjectId of UVLogs, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
UVLogs.update = function(id, update, success, error) {
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

    DBAdapter.update(UVLogs.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
UVLogs.delete = function(data, success, error) {
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

    DBAdapter.delete(UVLogs.name, data, successCB, errorCB);
};

// "id" : the ObjectId of UVLogs, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in UVLogs
UVLogs.set = function(id, newData, success, error) {
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

    DBAdapter.update(UVLogs.name, data, successCB, errorCB);
};

// Add the other functions here


