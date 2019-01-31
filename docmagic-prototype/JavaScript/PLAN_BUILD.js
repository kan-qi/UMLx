
var PLAN_BUILD = {};

PLAN_BUILD.name = "PLAN_BUILD";              // Model name

PLAN_BUILD.attributes = [            // Model attribute list
    "DESC", "State", "Desc", "Comments", "ReviewDate"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PLAN_BUILD
PLAN_BUILD.create = function(data, success, error) {
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

    DBAdapter.create(PLAN_BUILD.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PLAN_BUILD, must be 24 character hex string 
PLAN_BUILD.get = function(id, success, error) {
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

    DBAdapter.get(PLAN_BUILD.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PLAN_BUILD.read = function(data, success, error) {
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

    DBAdapter.read(PLAN_BUILD.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PLAN_BUILD, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PLAN_BUILD.update = function(id, update, success, error) {
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

    DBAdapter.update(PLAN_BUILD.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PLAN_BUILD.delete = function(data, success, error) {
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

    DBAdapter.delete(PLAN_BUILD.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PLAN_BUILD, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PLAN_BUILD
PLAN_BUILD.set = function(id, newData, success, error) {
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

    DBAdapter.update(PLAN_BUILD.name, data, successCB, errorCB);
};

// Add the other functions here


