
var WS_FIELDS = {};

WS_FIELDS.name = "WS_FIELDS";              // Model name

WS_FIELDS.attributes = [            // Model attribute list
    "FieldData"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_FIELDS
WS_FIELDS.create = function(data, success, error) {
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

    DBAdapter.create(WS_FIELDS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_FIELDS, must be 24 character hex string 
WS_FIELDS.get = function(id, success, error) {
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

    DBAdapter.get(WS_FIELDS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_FIELDS.read = function(data, success, error) {
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

    DBAdapter.read(WS_FIELDS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_FIELDS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_FIELDS.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_FIELDS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_FIELDS.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_FIELDS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_FIELDS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_FIELDS
WS_FIELDS.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_FIELDS.name, data, successCB, errorCB);
};

// Add the other functions here


