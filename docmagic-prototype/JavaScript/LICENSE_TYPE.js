
var LICENSE_TYPE = {};

LICENSE_TYPE.name = "LICENSE_TYPE";              // Model name

LICENSE_TYPE.attributes = [            // Model attribute list
    "Description", "Enabled", "State"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LICENSE_TYPE
LICENSE_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(LICENSE_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LICENSE_TYPE, must be 24 character hex string 
LICENSE_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(LICENSE_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LICENSE_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(LICENSE_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LICENSE_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LICENSE_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(LICENSE_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LICENSE_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(LICENSE_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LICENSE_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LICENSE_TYPE
LICENSE_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(LICENSE_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


