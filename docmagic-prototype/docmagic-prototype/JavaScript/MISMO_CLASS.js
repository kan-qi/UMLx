
var MISMO_CLASS = {};

MISMO_CLASS.name = "MISMO_CLASS";              // Model name

MISMO_CLASS.attributes = [            // Model attribute list
    "Description", "NonMismo", "Priority", "InInventory", "AllowDelete", "Purpose"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in MISMO_CLASS
MISMO_CLASS.create = function(data, success, error) {
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

    DBAdapter.create(MISMO_CLASS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of MISMO_CLASS, must be 24 character hex string 
MISMO_CLASS.get = function(id, success, error) {
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

    DBAdapter.get(MISMO_CLASS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
MISMO_CLASS.read = function(data, success, error) {
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

    DBAdapter.read(MISMO_CLASS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MISMO_CLASS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
MISMO_CLASS.update = function(id, update, success, error) {
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

    DBAdapter.update(MISMO_CLASS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
MISMO_CLASS.delete = function(data, success, error) {
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

    DBAdapter.delete(MISMO_CLASS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of MISMO_CLASS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in MISMO_CLASS
MISMO_CLASS.set = function(id, newData, success, error) {
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

    DBAdapter.update(MISMO_CLASS.name, data, successCB, errorCB);
};

// Add the other functions here


