
var BRANCH_DO = {};

BRANCH_DO.name = "BRANCH_DO";              // Model name

BRANCH_DO.attributes = [            // Model attribute list
    "BRANCHCODE", "BranchName", "Address", "City", "State", "Zip"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in BRANCH_DO
BRANCH_DO.create = function(data, success, error) {
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

    DBAdapter.create(BRANCH_DO.name, data, successCB, errorCB);
};


// "id" : the ObjectId of BRANCH_DO, must be 24 character hex string 
BRANCH_DO.get = function(id, success, error) {
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

    DBAdapter.get(BRANCH_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
BRANCH_DO.read = function(data, success, error) {
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

    DBAdapter.read(BRANCH_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BRANCH_DO, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
BRANCH_DO.update = function(id, update, success, error) {
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

    DBAdapter.update(BRANCH_DO.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
BRANCH_DO.delete = function(data, success, error) {
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

    DBAdapter.delete(BRANCH_DO.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BRANCH_DO, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in BRANCH_DO
BRANCH_DO.set = function(id, newData, success, error) {
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

    DBAdapter.update(BRANCH_DO.name, data, successCB, errorCB);
};

// Add the other functions here


