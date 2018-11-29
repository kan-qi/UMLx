
var TaxTranscript = {};

TaxTranscript.name = "TaxTranscript";              // Model name

TaxTranscript.attributes = [            // Model attribute list
    "Content"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in TaxTranscript
TaxTranscript.create = function(data, success, error) {
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

    DBAdapter.create(TaxTranscript.name, data, successCB, errorCB);
};


// "id" : the ObjectId of TaxTranscript, must be 24 character hex string 
TaxTranscript.get = function(id, success, error) {
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

    DBAdapter.get(TaxTranscript.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
TaxTranscript.read = function(data, success, error) {
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

    DBAdapter.read(TaxTranscript.name, data, successCB, errorCB);
};

// "id" : the ObjectId of TaxTranscript, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
TaxTranscript.update = function(id, update, success, error) {
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

    DBAdapter.update(TaxTranscript.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
TaxTranscript.delete = function(data, success, error) {
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

    DBAdapter.delete(TaxTranscript.name, data, successCB, errorCB);
};

// "id" : the ObjectId of TaxTranscript, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in TaxTranscript
TaxTranscript.set = function(id, newData, success, error) {
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

    DBAdapter.update(TaxTranscript.name, data, successCB, errorCB);
};

// Add the other functions here


