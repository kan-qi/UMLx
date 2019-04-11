
var FORM_LIST = {};

FORM_LIST.name = "FORM_LIST";              // Model name

FORM_LIST.attributes = [            // Model attribute list
    "Form", "FormSigner", "FormListError", "Feature", "PrepayPenaltyProvisionIndicator", "UsesFeatures", "WorksheetNumber", "PlanCode", "FieldDefinition"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FORM_LIST
FORM_LIST.create = function(data, success, error) {
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

    DBAdapter.create(FORM_LIST.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FORM_LIST, must be 24 character hex string 
FORM_LIST.get = function(id, success, error) {
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

    DBAdapter.get(FORM_LIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FORM_LIST.read = function(data, success, error) {
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

    DBAdapter.read(FORM_LIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FORM_LIST, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FORM_LIST.update = function(id, update, success, error) {
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

    DBAdapter.update(FORM_LIST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FORM_LIST.delete = function(data, success, error) {
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

    DBAdapter.delete(FORM_LIST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FORM_LIST, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FORM_LIST
FORM_LIST.set = function(id, newData, success, error) {
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

    DBAdapter.update(FORM_LIST.name, data, successCB, errorCB);
};

// Add the other functions here


