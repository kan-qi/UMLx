
var DEL_VIA = {};

DEL_VIA.name = "DEL_VIA";              // Model name

DEL_VIA.attributes = [            // Model attribute list
    "DeliverViaCode", "Description", "AdditionalAmount", "ShortDescription", "OrderTypeID", "SalesForceProductId", "TrackFirstOrder"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DEL_VIA
DEL_VIA.create = function(data, success, error) {
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

    DBAdapter.create(DEL_VIA.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DEL_VIA, must be 24 character hex string 
DEL_VIA.get = function(id, success, error) {
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

    DBAdapter.get(DEL_VIA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DEL_VIA.read = function(data, success, error) {
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

    DBAdapter.read(DEL_VIA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DEL_VIA, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DEL_VIA.update = function(id, update, success, error) {
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

    DBAdapter.update(DEL_VIA.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DEL_VIA.delete = function(data, success, error) {
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

    DBAdapter.delete(DEL_VIA.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DEL_VIA, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DEL_VIA
DEL_VIA.set = function(id, newData, success, error) {
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

    DBAdapter.update(DEL_VIA.name, data, successCB, errorCB);
};

// Add the other functions here


