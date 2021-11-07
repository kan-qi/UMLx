
var PROVIDER = {};

PROVIDER.name = "PROVIDER";              // Model name

PROVIDER.attributes = [            // Model attribute list
    "ProviderName", "Address", "City", "State", "Zip", "ServiceType", "RelationCode", "RelationDescription"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PROVIDER
PROVIDER.create = function(data, success, error) {
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

    DBAdapter.create(PROVIDER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PROVIDER, must be 24 character hex string 
PROVIDER.get = function(id, success, error) {
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

    DBAdapter.get(PROVIDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PROVIDER.read = function(data, success, error) {
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

    DBAdapter.read(PROVIDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PROVIDER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PROVIDER.update = function(id, update, success, error) {
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

    DBAdapter.update(PROVIDER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PROVIDER.delete = function(data, success, error) {
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

    DBAdapter.delete(PROVIDER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PROVIDER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PROVIDER
PROVIDER.set = function(id, newData, success, error) {
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

    DBAdapter.update(PROVIDER.name, data, successCB, errorCB);
};

// Add the other functions here


