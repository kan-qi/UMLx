
var BorrowerMobile = {};

BorrowerMobile.name = "BorrowerMobile";              // Model name

BorrowerMobile.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in BorrowerMobile
BorrowerMobile.create = function(data, success, error) {
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

    DBAdapter.create(BorrowerMobile.name, data, successCB, errorCB);
};


// "id" : the ObjectId of BorrowerMobile, must be 24 character hex string 
BorrowerMobile.get = function(id, success, error) {
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

    DBAdapter.get(BorrowerMobile.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
BorrowerMobile.read = function(data, success, error) {
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

    DBAdapter.read(BorrowerMobile.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BorrowerMobile, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
BorrowerMobile.update = function(id, update, success, error) {
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

    DBAdapter.update(BorrowerMobile.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
BorrowerMobile.delete = function(data, success, error) {
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

    DBAdapter.delete(BorrowerMobile.name, data, successCB, errorCB);
};

// "id" : the ObjectId of BorrowerMobile, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in BorrowerMobile
BorrowerMobile.set = function(id, newData, success, error) {
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

    DBAdapter.update(BorrowerMobile.name, data, successCB, errorCB);
};

// Add the other functions here


