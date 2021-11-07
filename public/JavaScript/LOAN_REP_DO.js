
var LOAN_REP_DO = {};

LOAN_REP_DO.name = "LOAN_REP_DO";              // Model name

LOAN_REP_DO.attributes = [            // Model attribute list
    "Name", "Phone", "Fax"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOAN_REP_DO
LOAN_REP_DO.create = function(data, success, error) {
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

    DBAdapter.create(LOAN_REP_DO.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOAN_REP_DO, must be 24 character hex string 
LOAN_REP_DO.get = function(id, success, error) {
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

    DBAdapter.get(LOAN_REP_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOAN_REP_DO.read = function(data, success, error) {
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

    DBAdapter.read(LOAN_REP_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_REP_DO, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOAN_REP_DO.update = function(id, update, success, error) {
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

    DBAdapter.update(LOAN_REP_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOAN_REP_DO.delete = function(data, success, error) {
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

    DBAdapter.delete(LOAN_REP_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_REP_DO, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOAN_REP_DO
LOAN_REP_DO.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOAN_REP_DO.name, data, successCB, errorCB);
};

// Add the other functions here


