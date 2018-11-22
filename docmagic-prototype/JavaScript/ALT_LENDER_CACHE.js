
var ALT_LENDER_CACHE = {};

ALT_LENDER_CACHE.name = "ALT_LENDER_CACHE";              // Model name

ALT_LENDER_CACHE.attributes = [            // Model attribute list
    "Info"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in ALT_LENDER_CACHE
ALT_LENDER_CACHE.create = function(data, success, error) {
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

    DBAdapter.create(ALT_LENDER_CACHE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of ALT_LENDER_CACHE, must be 24 character hex string 
ALT_LENDER_CACHE.get = function(id, success, error) {
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

    DBAdapter.get(ALT_LENDER_CACHE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
ALT_LENDER_CACHE.read = function(data, success, error) {
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

    DBAdapter.read(ALT_LENDER_CACHE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ALT_LENDER_CACHE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
ALT_LENDER_CACHE.update = function(id, update, success, error) {
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

    DBAdapter.update(ALT_LENDER_CACHE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
ALT_LENDER_CACHE.delete = function(data, success, error) {
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

    DBAdapter.delete(ALT_LENDER_CACHE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ALT_LENDER_CACHE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in ALT_LENDER_CACHE
ALT_LENDER_CACHE.set = function(id, newData, success, error) {
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

    DBAdapter.update(ALT_LENDER_CACHE.name, data, successCB, errorCB);
};

// Add the other functions here


