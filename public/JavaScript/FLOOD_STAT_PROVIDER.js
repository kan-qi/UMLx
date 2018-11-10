
var FLOOD_STAT_PROVIDER = {};

FLOOD_STAT_PROVIDER.name = "FLOOD_STAT_PROVIDER";              // Model name

FLOOD_STAT_PROVIDER.attributes = [            // Model attribute list
    "Provider"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FLOOD_STAT_PROVIDER
FLOOD_STAT_PROVIDER.create = function(data, success, error) {
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

    DBAdapter.create(FLOOD_STAT_PROVIDER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FLOOD_STAT_PROVIDER, must be 24 character hex string 
FLOOD_STAT_PROVIDER.get = function(id, success, error) {
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

    DBAdapter.get(FLOOD_STAT_PROVIDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FLOOD_STAT_PROVIDER.read = function(data, success, error) {
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

    DBAdapter.read(FLOOD_STAT_PROVIDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_STAT_PROVIDER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FLOOD_STAT_PROVIDER.update = function(id, update, success, error) {
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

    DBAdapter.update(FLOOD_STAT_PROVIDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FLOOD_STAT_PROVIDER.delete = function(data, success, error) {
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

    DBAdapter.delete(FLOOD_STAT_PROVIDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FLOOD_STAT_PROVIDER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FLOOD_STAT_PROVIDER
FLOOD_STAT_PROVIDER.set = function(id, newData, success, error) {
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

    DBAdapter.update(FLOOD_STAT_PROVIDER.name, data, successCB, errorCB);
};

// Add the other functions here


