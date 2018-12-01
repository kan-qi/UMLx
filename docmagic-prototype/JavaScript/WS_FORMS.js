
var WS_FORMS = {};

WS_FORMS.name = "WS_FORMS";              // Model name

WS_FORMS.attributes = [            // Model attribute list
    "DocumentReferenceId", "Form"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_FORMS
WS_FORMS.create = function(data, success, error) {
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

    DBAdapter.create(WS_FORMS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_FORMS, must be 24 character hex string 
WS_FORMS.get = function(id, success, error) {
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

    DBAdapter.get(WS_FORMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_FORMS.read = function(data, success, error) {
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

    DBAdapter.read(WS_FORMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_FORMS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_FORMS.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_FORMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_FORMS.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_FORMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_FORMS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_FORMS
WS_FORMS.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_FORMS.name, data, successCB, errorCB);
};

// Add the other functions here


