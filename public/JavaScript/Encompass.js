
var Encompass = {};

Encompass.name = "Encompass";              // Model name

Encompass.attributes = [            // Model attribute list
    "noNamespaceSchemaLocation", "EMXMLVersionID"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in Encompass
Encompass.create = function(data, success, error) {
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

    DBAdapter.create(Encompass.name, data, successCB, errorCB);
};


// "id" : the ObjectId of Encompass, must be 24 character hex string 
Encompass.get = function(id, success, error) {
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

    DBAdapter.get(Encompass.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
Encompass.read = function(data, success, error) {
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

    DBAdapter.read(Encompass.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Encompass, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
Encompass.update = function(id, update, success, error) {
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

    DBAdapter.update(Encompass.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
Encompass.delete = function(data, success, error) {
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

    DBAdapter.delete(Encompass.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Encompass, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in Encompass
Encompass.set = function(id, newData, success, error) {
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

    DBAdapter.update(Encompass.name, data, successCB, errorCB);
};

// Add the other functions here


