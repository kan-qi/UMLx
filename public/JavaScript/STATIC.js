
var STATIC = {};

STATIC.name = "STATIC";              // Model name

STATIC.attributes = [            // Model attribute list
    "LanguageType", "HomeownershipCounselingServiceType", "ChangedCircumstanceReasonType", "DisclosureType", "PrepaidItemType"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in STATIC
STATIC.create = function(data, success, error) {
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

    DBAdapter.create(STATIC.name, data, successCB, errorCB);
};


// "id" : the ObjectId of STATIC, must be 24 character hex string 
STATIC.get = function(id, success, error) {
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

    DBAdapter.get(STATIC.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
STATIC.read = function(data, success, error) {
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

    DBAdapter.read(STATIC.name, data, successCB, errorCB);
};

// "id" : the ObjectId of STATIC, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
STATIC.update = function(id, update, success, error) {
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

    DBAdapter.update(STATIC.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
STATIC.delete = function(data, success, error) {
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

    DBAdapter.delete(STATIC.name, data, successCB, errorCB);
};

// "id" : the ObjectId of STATIC, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in STATIC
STATIC.set = function(id, newData, success, error) {
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

    DBAdapter.update(STATIC.name, data, successCB, errorCB);
};

// Add the other functions here


