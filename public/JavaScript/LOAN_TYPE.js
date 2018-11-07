
var LOAN_TYPE = {};

LOAN_TYPE.name = "LOAN_TYPE";              // Model name

LOAN_TYPE.attributes = [            // Model attribute list
    "LoanType", "Description", "WebCode", "WebCodeDefault"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOAN_TYPE
LOAN_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(LOAN_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOAN_TYPE, must be 24 character hex string 
LOAN_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(LOAN_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOAN_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(LOAN_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOAN_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(LOAN_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOAN_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(LOAN_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOAN_TYPE
LOAN_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOAN_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


