
var WS_EXTENDED_DATA = {};

WS_EXTENDED_DATA.name = "WS_EXTENDED_DATA";              // Model name

WS_EXTENDED_DATA.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_EXTENDED_DATA
WS_EXTENDED_DATA.create = function(data, success, error) {
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

    DBAdapter.create(WS_EXTENDED_DATA.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_EXTENDED_DATA, must be 24 character hex string 
WS_EXTENDED_DATA.get = function(id, success, error) {
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

    DBAdapter.get(WS_EXTENDED_DATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_EXTENDED_DATA.read = function(data, success, error) {
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

    DBAdapter.read(WS_EXTENDED_DATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_EXTENDED_DATA, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_EXTENDED_DATA.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_EXTENDED_DATA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_EXTENDED_DATA.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_EXTENDED_DATA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_EXTENDED_DATA, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_EXTENDED_DATA
WS_EXTENDED_DATA.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_EXTENDED_DATA.name, data, successCB, errorCB);
};

// Add the other functions here


