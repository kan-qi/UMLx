
var WS_DO_CACHE = {};

WS_DO_CACHE.name = "WS_DO_CACHE";              // Model name

WS_DO_CACHE.attributes = [            // Model attribute list
    "Info"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_DO_CACHE
WS_DO_CACHE.create = function(data, success, error) {
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

    DBAdapter.create(WS_DO_CACHE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_DO_CACHE, must be 24 character hex string 
WS_DO_CACHE.get = function(id, success, error) {
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

    DBAdapter.get(WS_DO_CACHE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_DO_CACHE.read = function(data, success, error) {
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

    DBAdapter.read(WS_DO_CACHE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_DO_CACHE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_DO_CACHE.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_DO_CACHE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_DO_CACHE.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_DO_CACHE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_DO_CACHE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_DO_CACHE
WS_DO_CACHE.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_DO_CACHE.name, data, successCB, errorCB);
};

// Add the other functions here


