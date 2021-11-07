
var GenesisObjects = {};

GenesisObjects.name = "GenesisObjects";              // Model name

GenesisObjects.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in GenesisObjects
GenesisObjects.create = function(data, success, error) {
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

    DBAdapter.create(GenesisObjects.name, data, successCB, errorCB);
};


// "id" : the ObjectId of GenesisObjects, must be 24 character hex string 
GenesisObjects.get = function(id, success, error) {
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

    DBAdapter.get(GenesisObjects.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
GenesisObjects.read = function(data, success, error) {
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

    DBAdapter.read(GenesisObjects.name, data, successCB, errorCB);
};

// "id" : the ObjectId of GenesisObjects, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
GenesisObjects.update = function(id, update, success, error) {
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

    DBAdapter.update(GenesisObjects.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
GenesisObjects.delete = function(data, success, error) {
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

    DBAdapter.delete(GenesisObjects.name, data, successCB, errorCB);
};

// "id" : the ObjectId of GenesisObjects, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in GenesisObjects
GenesisObjects.set = function(id, newData, success, error) {
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

    DBAdapter.update(GenesisObjects.name, data, successCB, errorCB);
};

// Add the other functions here


