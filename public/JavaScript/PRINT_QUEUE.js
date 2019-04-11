
var PRINT_QUEUE = {};

PRINT_QUEUE.name = "PRINT_QUEUE";              // Model name

PRINT_QUEUE.attributes = [            // Model attribute list
    "Date", "Time", "PackageType", "CallbackURL", "Status", "WebDocsCode", "TransactionId", "ProcessException", "ImmediateIndicator", "GFSReferenceIdentifier"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PRINT_QUEUE
PRINT_QUEUE.create = function(data, success, error) {
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

    DBAdapter.create(PRINT_QUEUE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PRINT_QUEUE, must be 24 character hex string 
PRINT_QUEUE.get = function(id, success, error) {
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

    DBAdapter.get(PRINT_QUEUE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PRINT_QUEUE.read = function(data, success, error) {
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

    DBAdapter.read(PRINT_QUEUE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PRINT_QUEUE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PRINT_QUEUE.update = function(id, update, success, error) {
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

    DBAdapter.update(PRINT_QUEUE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PRINT_QUEUE.delete = function(data, success, error) {
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

    DBAdapter.delete(PRINT_QUEUE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PRINT_QUEUE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PRINT_QUEUE
PRINT_QUEUE.set = function(id, newData, success, error) {
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

    DBAdapter.update(PRINT_QUEUE.name, data, successCB, errorCB);
};

// Add the other functions here


