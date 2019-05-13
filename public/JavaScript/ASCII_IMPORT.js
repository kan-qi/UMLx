
var ASCII_IMPORT = {};

ASCII_IMPORT.name = "ASCII_IMPORT";              // Model name

ASCII_IMPORT.attributes = [            // Model attribute list
    "ProcessName", "Description", "Notes", "DOSfileName", "Type", "Delimiter", "Fixedlength", "Overwrite", "DeleteFile"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in ASCII_IMPORT
ASCII_IMPORT.create = function(data, success, error) {
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

    DBAdapter.create(ASCII_IMPORT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of ASCII_IMPORT, must be 24 character hex string 
ASCII_IMPORT.get = function(id, success, error) {
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

    DBAdapter.get(ASCII_IMPORT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
ASCII_IMPORT.read = function(data, success, error) {
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

    DBAdapter.read(ASCII_IMPORT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ASCII_IMPORT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
ASCII_IMPORT.update = function(id, update, success, error) {
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

    DBAdapter.update(ASCII_IMPORT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
ASCII_IMPORT.delete = function(data, success, error) {
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

    DBAdapter.delete(ASCII_IMPORT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ASCII_IMPORT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in ASCII_IMPORT
ASCII_IMPORT.set = function(id, newData, success, error) {
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

    DBAdapter.update(ASCII_IMPORT.name, data, successCB, errorCB);
};

// Add the other functions here


