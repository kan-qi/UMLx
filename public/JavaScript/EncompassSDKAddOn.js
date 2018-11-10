
var EncompassSDKAddOn = {};

EncompassSDKAddOn.name = "EncompassSDKAddOn";              // Model name

EncompassSDKAddOn.attributes = [            // Model attribute list
    "1149", "1870", "1871", "1875", "1876", "L351", "L352", "1859", "1860", "1861", "2554"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in EncompassSDKAddOn
EncompassSDKAddOn.create = function(data, success, error) {
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

    DBAdapter.create(EncompassSDKAddOn.name, data, successCB, errorCB);
};


// "id" : the ObjectId of EncompassSDKAddOn, must be 24 character hex string 
EncompassSDKAddOn.get = function(id, success, error) {
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

    DBAdapter.get(EncompassSDKAddOn.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
EncompassSDKAddOn.read = function(data, success, error) {
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

    DBAdapter.read(EncompassSDKAddOn.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EncompassSDKAddOn, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
EncompassSDKAddOn.update = function(id, update, success, error) {
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

    DBAdapter.update(EncompassSDKAddOn.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
EncompassSDKAddOn.delete = function(data, success, error) {
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

    DBAdapter.delete(EncompassSDKAddOn.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EncompassSDKAddOn, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in EncompassSDKAddOn
EncompassSDKAddOn.set = function(id, newData, success, error) {
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

    DBAdapter.update(EncompassSDKAddOn.name, data, successCB, errorCB);
};

// Add the other functions here


