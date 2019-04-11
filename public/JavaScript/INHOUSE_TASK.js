
var INHOUSE_TASK = {};

INHOUSE_TASK.name = "INHOUSE_TASK";              // Model name

INHOUSE_TASK.attributes = [            // Model attribute list
    "Description", "ParentTask", "MenuCodePreFix", "Status", "GroupId", "NeoPostComplete"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in INHOUSE_TASK
INHOUSE_TASK.create = function(data, success, error) {
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

    DBAdapter.create(INHOUSE_TASK.name, data, successCB, errorCB);
};


// "id" : the ObjectId of INHOUSE_TASK, must be 24 character hex string 
INHOUSE_TASK.get = function(id, success, error) {
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

    DBAdapter.get(INHOUSE_TASK.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
INHOUSE_TASK.read = function(data, success, error) {
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

    DBAdapter.read(INHOUSE_TASK.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INHOUSE_TASK, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
INHOUSE_TASK.update = function(id, update, success, error) {
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

    DBAdapter.update(INHOUSE_TASK.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
INHOUSE_TASK.delete = function(data, success, error) {
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

    DBAdapter.delete(INHOUSE_TASK.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INHOUSE_TASK, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in INHOUSE_TASK
INHOUSE_TASK.set = function(id, newData, success, error) {
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

    DBAdapter.update(INHOUSE_TASK.name, data, successCB, errorCB);
};

// Add the other functions here


