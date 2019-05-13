
var WS_ATTACHMENT = {};

WS_ATTACHMENT.name = "WS_ATTACHMENT";              // Model name

WS_ATTACHMENT.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS_ATTACHMENT
WS_ATTACHMENT.create = function(data, success, error) {
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

    DBAdapter.create(WS_ATTACHMENT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS_ATTACHMENT, must be 24 character hex string 
WS_ATTACHMENT.get = function(id, success, error) {
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

    DBAdapter.get(WS_ATTACHMENT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS_ATTACHMENT.read = function(data, success, error) {
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

    DBAdapter.read(WS_ATTACHMENT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_ATTACHMENT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS_ATTACHMENT.update = function(id, update, success, error) {
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

    DBAdapter.update(WS_ATTACHMENT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS_ATTACHMENT.delete = function(data, success, error) {
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

    DBAdapter.delete(WS_ATTACHMENT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS_ATTACHMENT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS_ATTACHMENT
WS_ATTACHMENT.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS_ATTACHMENT.name, data, successCB, errorCB);
};

// Add the other functions here


