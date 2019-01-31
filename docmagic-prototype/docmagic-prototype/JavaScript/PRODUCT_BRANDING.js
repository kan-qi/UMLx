
var PRODUCT_BRANDING = {};

PRODUCT_BRANDING.name = "PRODUCT_BRANDING";              // Model name

PRODUCT_BRANDING.attributes = [            // Model attribute list
    "LoanStage"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PRODUCT_BRANDING
PRODUCT_BRANDING.create = function(data, success, error) {
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

    DBAdapter.create(PRODUCT_BRANDING.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PRODUCT_BRANDING, must be 24 character hex string 
PRODUCT_BRANDING.get = function(id, success, error) {
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

    DBAdapter.get(PRODUCT_BRANDING.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PRODUCT_BRANDING.read = function(data, success, error) {
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

    DBAdapter.read(PRODUCT_BRANDING.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PRODUCT_BRANDING, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PRODUCT_BRANDING.update = function(id, update, success, error) {
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

    DBAdapter.update(PRODUCT_BRANDING.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PRODUCT_BRANDING.delete = function(data, success, error) {
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

    DBAdapter.delete(PRODUCT_BRANDING.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PRODUCT_BRANDING, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PRODUCT_BRANDING
PRODUCT_BRANDING.set = function(id, newData, success, error) {
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

    DBAdapter.update(PRODUCT_BRANDING.name, data, successCB, errorCB);
};

// Add the other functions here


