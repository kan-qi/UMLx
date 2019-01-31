
var DataVerify = {};

DataVerify.name = "DataVerify";              // Model name

DataVerify.attributes = [            // Model attribute list
    "Version", "PostBackURL"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DataVerify
DataVerify.create = function(data, success, error) {
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

    DBAdapter.create(DataVerify.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DataVerify, must be 24 character hex string 
DataVerify.get = function(id, success, error) {
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

    DBAdapter.get(DataVerify.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DataVerify.read = function(data, success, error) {
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

    DBAdapter.read(DataVerify.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DataVerify, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DataVerify.update = function(id, update, success, error) {
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

    DBAdapter.update(DataVerify.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DataVerify.delete = function(data, success, error) {
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

    DBAdapter.delete(DataVerify.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DataVerify, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DataVerify
DataVerify.set = function(id, newData, success, error) {
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

    DBAdapter.update(DataVerify.name, data, successCB, errorCB);
};

// Add the other functions here


