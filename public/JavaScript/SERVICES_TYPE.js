
var SERVICES_TYPE = {};

SERVICES_TYPE.name = "SERVICES_TYPE";              // Model name

SERVICES_TYPE.attributes = [            // Model attribute list
    "Description", "CoreService", "Enabled", "Subscription"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in SERVICES_TYPE
SERVICES_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(SERVICES_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of SERVICES_TYPE, must be 24 character hex string 
SERVICES_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(SERVICES_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
SERVICES_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(SERVICES_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of SERVICES_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
SERVICES_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(SERVICES_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
SERVICES_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(SERVICES_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of SERVICES_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in SERVICES_TYPE
SERVICES_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(SERVICES_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


