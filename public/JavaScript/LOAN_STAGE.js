
var LOAN_STAGE = {};

LOAN_STAGE.name = "LOAN_STAGE";              // Model name

LOAN_STAGE.attributes = [            // Model attribute list
    "Description", "PackageType", "SortPriority", "SubordinateFinancing_"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOAN_STAGE
LOAN_STAGE.create = function(data, success, error) {
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

    DBAdapter.create(LOAN_STAGE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOAN_STAGE, must be 24 character hex string 
LOAN_STAGE.get = function(id, success, error) {
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

    DBAdapter.get(LOAN_STAGE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOAN_STAGE.read = function(data, success, error) {
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

    DBAdapter.read(LOAN_STAGE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_STAGE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOAN_STAGE.update = function(id, update, success, error) {
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

    DBAdapter.update(LOAN_STAGE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOAN_STAGE.delete = function(data, success, error) {
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

    DBAdapter.delete(LOAN_STAGE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_STAGE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOAN_STAGE
LOAN_STAGE.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOAN_STAGE.name, data, successCB, errorCB);
};

// Add the other functions here


