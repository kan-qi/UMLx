
var HIGH_COST = {};

HIGH_COST.name = "HIGH_COST";              // Model name

HIGH_COST.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in HIGH_COST
HIGH_COST.create = function(data, success, error) {
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

    DBAdapter.create(HIGH_COST.name, data, successCB, errorCB);
};


// "id" : the ObjectId of HIGH_COST, must be 24 character hex string 
HIGH_COST.get = function(id, success, error) {
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

    DBAdapter.get(HIGH_COST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
HIGH_COST.read = function(data, success, error) {
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

    DBAdapter.read(HIGH_COST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of HIGH_COST, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
HIGH_COST.update = function(id, update, success, error) {
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

    DBAdapter.update(HIGH_COST.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
HIGH_COST.delete = function(data, success, error) {
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

    DBAdapter.delete(HIGH_COST.name, data, successCB, errorCB);
};

// "id" : the ObjectId of HIGH_COST, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in HIGH_COST
HIGH_COST.set = function(id, newData, success, error) {
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

    DBAdapter.update(HIGH_COST.name, data, successCB, errorCB);
};

// Add the other functions here


