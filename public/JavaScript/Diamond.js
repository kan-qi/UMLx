
var Diamond = {};

Diamond.name = "Diamond";              // Model name

Diamond.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in Diamond
Diamond.create = function(data, success, error) {
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

    DBAdapter.create(Diamond.name, data, successCB, errorCB);
};


// "id" : the ObjectId of Diamond, must be 24 character hex string 
Diamond.get = function(id, success, error) {
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

    DBAdapter.get(Diamond.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
Diamond.read = function(data, success, error) {
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

    DBAdapter.read(Diamond.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Diamond, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
Diamond.update = function(id, update, success, error) {
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

    DBAdapter.update(Diamond.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
Diamond.delete = function(data, success, error) {
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

    DBAdapter.delete(Diamond.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Diamond, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in Diamond
Diamond.set = function(id, newData, success, error) {
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

    DBAdapter.update(Diamond.name, data, successCB, errorCB);
};

// Add the other functions here


