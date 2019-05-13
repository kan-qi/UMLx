
var LOXml = {};

LOXml.name = "LOXml";              // Model name

LOXml.attributes = [            // Model attribute list
    "field", "applicant", "collection"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOXml
LOXml.create = function(data, success, error) {
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

    DBAdapter.create(LOXml.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOXml, must be 24 character hex string 
LOXml.get = function(id, success, error) {
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

    DBAdapter.get(LOXml.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOXml.read = function(data, success, error) {
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

    DBAdapter.read(LOXml.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOXml, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOXml.update = function(id, update, success, error) {
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

    DBAdapter.update(LOXml.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOXml.delete = function(data, success, error) {
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

    DBAdapter.delete(LOXml.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOXml, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOXml
LOXml.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOXml.name, data, successCB, errorCB);
};

// Add the other functions here


