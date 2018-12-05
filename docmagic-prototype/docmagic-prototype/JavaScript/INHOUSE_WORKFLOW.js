
var INHOUSE_WORKFLOW = {};

INHOUSE_WORKFLOW.name = "INHOUSE_WORKFLOW";              // Model name

INHOUSE_WORKFLOW.attributes = [            // Model attribute list
    "Simplex", "TaskId", "Label", "Logic", "Group", "CopyCount", "EnvelopeType", "EnvelopeReturnType", "LabelIDList", "Format"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in INHOUSE_WORKFLOW
INHOUSE_WORKFLOW.create = function(data, success, error) {
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

    DBAdapter.create(INHOUSE_WORKFLOW.name, data, successCB, errorCB);
};


// "id" : the ObjectId of INHOUSE_WORKFLOW, must be 24 character hex string 
INHOUSE_WORKFLOW.get = function(id, success, error) {
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

    DBAdapter.get(INHOUSE_WORKFLOW.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
INHOUSE_WORKFLOW.read = function(data, success, error) {
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

    DBAdapter.read(INHOUSE_WORKFLOW.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INHOUSE_WORKFLOW, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
INHOUSE_WORKFLOW.update = function(id, update, success, error) {
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

    DBAdapter.update(INHOUSE_WORKFLOW.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
INHOUSE_WORKFLOW.delete = function(data, success, error) {
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

    DBAdapter.delete(INHOUSE_WORKFLOW.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INHOUSE_WORKFLOW, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in INHOUSE_WORKFLOW
INHOUSE_WORKFLOW.set = function(id, newData, success, error) {
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

    DBAdapter.update(INHOUSE_WORKFLOW.name, data, successCB, errorCB);
};

// Add the other functions here


