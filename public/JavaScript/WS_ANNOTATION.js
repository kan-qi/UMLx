
var WS_ANNOTATION = {};

WS_ANNOTATION.name = "WS_ANNOTATION";              // Model name

WS_ANNOTATION.attributes = [            // Model attribute list
    "WorksheetNumber"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_ANNOTATION
WS_ANNOTATION.create = function(data, success, error) {
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

    DBAdapter.create(WS_ANNOTATION.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_ANNOTATION, must be 24 character hex string 
WS_ANNOTATION.get = function(id, success, error) {
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

    DBAdapter.get(WS_ANNOTATION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_ANNOTATION.read = function(data, success, error) {
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

    DBAdapter.read(WS_ANNOTATION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_ANNOTATION, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_ANNOTATION.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_ANNOTATION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_ANNOTATION.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_ANNOTATION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_ANNOTATION, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_ANNOTATION
WS_ANNOTATION.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_ANNOTATION.name, data, successCB, errorCB);
};

// Add the other functions here


