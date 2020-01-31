
var NOTES_TYPE = {};

NOTES_TYPE.name = "NOTES_TYPE";              // Model name

NOTES_TYPE.attributes = [            // Model attribute list
    "DocMagicNoteType", "Description", "Type", "Nextsteprequired"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in NOTES_TYPE
NOTES_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(NOTES_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of NOTES_TYPE, must be 24 character hex string 
NOTES_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(NOTES_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
NOTES_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(NOTES_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NOTES_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
NOTES_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(NOTES_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
NOTES_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(NOTES_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of NOTES_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in NOTES_TYPE
NOTES_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(NOTES_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


