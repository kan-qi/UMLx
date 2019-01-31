
var FORMS = {};

FORMS.name = "FORMS";              // Model name

FORMS.attributes = [            // Model attribute list
    "dsiFORMSFlag", "ADDITIONAL_SIGNATURE", "ALTERNATE_SIGNATURE"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in FORMS
FORMS.create = function(data, success, error) {
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

    DBAdapter.create(FORMS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of FORMS, must be 24 character hex string 
FORMS.get = function(id, success, error) {
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

    DBAdapter.get(FORMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
FORMS.read = function(data, success, error) {
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

    DBAdapter.read(FORMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FORMS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
FORMS.update = function(id, update, success, error) {
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

    DBAdapter.update(FORMS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
FORMS.delete = function(data, success, error) {
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

    DBAdapter.delete(FORMS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of FORMS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in FORMS
FORMS.set = function(id, newData, success, error) {
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

    DBAdapter.update(FORMS.name, data, successCB, errorCB);
};

// Add the other functions here


