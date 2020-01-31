
var LOAN_DEFAULTS = {};

LOAN_DEFAULTS.name = "LOAN_DEFAULTS";              // Model name

LOAN_DEFAULTS.attributes = [            // Model attribute list
    "LoanDefaultID"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOAN_DEFAULTS
LOAN_DEFAULTS.create = function(data, success, error) {
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

    DBAdapter.create(LOAN_DEFAULTS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOAN_DEFAULTS, must be 24 character hex string 
LOAN_DEFAULTS.get = function(id, success, error) {
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

    DBAdapter.get(LOAN_DEFAULTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOAN_DEFAULTS.read = function(data, success, error) {
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

    DBAdapter.read(LOAN_DEFAULTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_DEFAULTS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOAN_DEFAULTS.update = function(id, update, success, error) {
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

    DBAdapter.update(LOAN_DEFAULTS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOAN_DEFAULTS.delete = function(data, success, error) {
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

    DBAdapter.delete(LOAN_DEFAULTS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_DEFAULTS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOAN_DEFAULTS
LOAN_DEFAULTS.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOAN_DEFAULTS.name, data, successCB, errorCB);
};

// Add the other functions here


