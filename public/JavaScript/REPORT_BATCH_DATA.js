
var REPORT_BATCH_DATA = {};

REPORT_BATCH_DATA.name = "REPORT_BATCH_DATA";              // Model name

REPORT_BATCH_DATA.attributes = [            // Model attribute list
    "Id", "Date", "UniqueID", "File"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in REPORT_BATCH_DATA
REPORT_BATCH_DATA.create = function(data, success, error) {
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

    DBAdapter.create(REPORT_BATCH_DATA.name, data, successCB, errorCB);
};


// "id" : the ObjectId of REPORT_BATCH_DATA, must be 24 character hex string 
REPORT_BATCH_DATA.get = function(id, success, error) {
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

    DBAdapter.get(REPORT_BATCH_DATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
REPORT_BATCH_DATA.read = function(data, success, error) {
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

    DBAdapter.read(REPORT_BATCH_DATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REPORT_BATCH_DATA, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
REPORT_BATCH_DATA.update = function(id, update, success, error) {
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

    DBAdapter.update(REPORT_BATCH_DATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
REPORT_BATCH_DATA.delete = function(data, success, error) {
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

    DBAdapter.delete(REPORT_BATCH_DATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REPORT_BATCH_DATA, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in REPORT_BATCH_DATA
REPORT_BATCH_DATA.set = function(id, newData, success, error) {
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

    DBAdapter.update(REPORT_BATCH_DATA.name, data, successCB, errorCB);
};

// Add the other functions here


