
var BROKER_DO = {};

BROKER_DO.name = "BROKER_DO";              // Model name

BROKER_DO.attributes = [            // Model attribute list
    "BrokerName", "Address", "City", "State", "Zip"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in BROKER_DO
BROKER_DO.create = function(data, success, error) {
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

    DBAdapter.create(BROKER_DO.name, data, successCB, errorCB);
};


// "id" : the ObjectId of BROKER_DO, must be 24 character hex string 
BROKER_DO.get = function(id, success, error) {
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

    DBAdapter.get(BROKER_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
BROKER_DO.read = function(data, success, error) {
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

    DBAdapter.read(BROKER_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BROKER_DO, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
BROKER_DO.update = function(id, update, success, error) {
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

    DBAdapter.update(BROKER_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
BROKER_DO.delete = function(data, success, error) {
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

    DBAdapter.delete(BROKER_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BROKER_DO, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in BROKER_DO
BROKER_DO.set = function(id, newData, success, error) {
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

    DBAdapter.update(BROKER_DO.name, data, successCB, errorCB);
};

// Add the other functions here


