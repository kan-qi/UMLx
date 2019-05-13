
var WS_VARS = {};

WS_VARS.name = "WS_VARS";              // Model name

WS_VARS.attributes = [            // Model attribute list
    "VariableName", "Description", "Formula", "Formsusing", "SampleOutput", "Notes", "PlanReqVariable", "FillScriptFunction", "ExpandedDesc"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_VARS
WS_VARS.create = function(data, success, error) {
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

    DBAdapter.create(WS_VARS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_VARS, must be 24 character hex string 
WS_VARS.get = function(id, success, error) {
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

    DBAdapter.get(WS_VARS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_VARS.read = function(data, success, error) {
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

    DBAdapter.read(WS_VARS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_VARS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_VARS.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_VARS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_VARS.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_VARS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_VARS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_VARS
WS_VARS.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_VARS.name, data, successCB, errorCB);
};

// Add the other functions here


