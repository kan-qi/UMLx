
var BARCODE_TYPE = {};

BARCODE_TYPE.name = "BARCODE_TYPE";              // Model name

BARCODE_TYPE.attributes = [            // Model attribute list
    "Description", "Format", "Formula", "Position", "Pages"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in BARCODE_TYPE
BARCODE_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(BARCODE_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of BARCODE_TYPE, must be 24 character hex string 
BARCODE_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(BARCODE_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
BARCODE_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(BARCODE_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BARCODE_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
BARCODE_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(BARCODE_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
BARCODE_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(BARCODE_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BARCODE_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in BARCODE_TYPE
BARCODE_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(BARCODE_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


