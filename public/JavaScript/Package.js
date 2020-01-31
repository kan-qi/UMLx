
var Package = {};

Package.name = "Package";              // Model name

Package.attributes = [            // Model attribute list
    "Version"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in Package
Package.create = function(data, success, error) {
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

    DBAdapter.create(Package.name, data, successCB, errorCB);
};


// "id" : the ObjectId of Package, must be 24 character hex string 
Package.get = function(id, success, error) {
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

    DBAdapter.get(Package.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
Package.read = function(data, success, error) {
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

    DBAdapter.read(Package.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Package, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
Package.update = function(id, update, success, error) {
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

    DBAdapter.update(Package.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
Package.delete = function(data, success, error) {
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

    DBAdapter.delete(Package.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Package, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in Package
Package.set = function(id, newData, success, error) {
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

    DBAdapter.update(Package.name, data, successCB, errorCB);
};

// Add the other functions here


