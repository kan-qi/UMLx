
var DataTrac = {};

DataTrac.name = "DataTrac";              // Model name

DataTrac.attributes = [            // Model attribute list
    "xGEM_LockHistory"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in DataTrac
DataTrac.create = function(data, success, error) {
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

    DBAdapter.create(DataTrac.name, data, successCB, errorCB);
};


// "id" : the ObjectId of DataTrac, must be 24 character hex string 
DataTrac.get = function(id, success, error) {
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

    DBAdapter.get(DataTrac.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
DataTrac.read = function(data, success, error) {
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

    DBAdapter.read(DataTrac.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DataTrac, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
DataTrac.update = function(id, update, success, error) {
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

    DBAdapter.update(DataTrac.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
DataTrac.delete = function(data, success, error) {
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

    DBAdapter.delete(DataTrac.name, data, successCB, errorCB);
};

// "id" : the ObjectId of DataTrac, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in DataTrac
DataTrac.set = function(id, newData, success, error) {
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

    DBAdapter.update(DataTrac.name, data, successCB, errorCB);
};

// Add the other functions here


