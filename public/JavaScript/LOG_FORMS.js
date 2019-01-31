
var LOG_FORMS = {};

LOG_FORMS.name = "LOG_FORMS";              // Model name

LOG_FORMS.attributes = [            // Model attribute list
    "LogNumber"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOG_FORMS
LOG_FORMS.create = function(data, success, error) {
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

    DBAdapter.create(LOG_FORMS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOG_FORMS, must be 24 character hex string 
LOG_FORMS.get = function(id, success, error) {
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

    DBAdapter.get(LOG_FORMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOG_FORMS.read = function(data, success, error) {
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

    DBAdapter.read(LOG_FORMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOG_FORMS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOG_FORMS.update = function(id, update, success, error) {
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

    DBAdapter.update(LOG_FORMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOG_FORMS.delete = function(data, success, error) {
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

    DBAdapter.delete(LOG_FORMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOG_FORMS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOG_FORMS
LOG_FORMS.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOG_FORMS.name, data, successCB, errorCB);
};

// Add the other functions here


