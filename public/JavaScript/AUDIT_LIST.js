
var AUDIT_LIST = {};

AUDIT_LIST.name = "AUDIT_LIST";              // Model name

AUDIT_LIST.attributes = [            // Model attribute list
    "Worksheet", "AuditFieldData"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in AUDIT_LIST
AUDIT_LIST.create = function(data, success, error) {
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

    DBAdapter.create(AUDIT_LIST.name, data, successCB, errorCB);
};


// "id" : the ObjectId of AUDIT_LIST, must be 24 character hex string 
AUDIT_LIST.get = function(id, success, error) {
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

    DBAdapter.get(AUDIT_LIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
AUDIT_LIST.read = function(data, success, error) {
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

    DBAdapter.read(AUDIT_LIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AUDIT_LIST, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
AUDIT_LIST.update = function(id, update, success, error) {
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

    DBAdapter.update(AUDIT_LIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
AUDIT_LIST.delete = function(data, success, error) {
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

    DBAdapter.delete(AUDIT_LIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AUDIT_LIST, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in AUDIT_LIST
AUDIT_LIST.set = function(id, newData, success, error) {
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

    DBAdapter.update(AUDIT_LIST.name, data, successCB, errorCB);
};

// Add the other functions here


