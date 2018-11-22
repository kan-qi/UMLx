
var EVENT = {};

EVENT.name = "EVENT";              // Model name

EVENT.attributes = [            // Model attribute list
    "EventID", "Name", "Description", "WebURL", "StartDate", "StartTime", "EndDate", "EndTime", "Type", "Venue", "City", "State", "Zip", "ProductLine"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in EVENT
EVENT.create = function(data, success, error) {
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

    DBAdapter.create(EVENT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of EVENT, must be 24 character hex string 
EVENT.get = function(id, success, error) {
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

    DBAdapter.get(EVENT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
EVENT.read = function(data, success, error) {
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

    DBAdapter.read(EVENT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EVENT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
EVENT.update = function(id, update, success, error) {
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

    DBAdapter.update(EVENT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
EVENT.delete = function(data, success, error) {
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

    DBAdapter.delete(EVENT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of EVENT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in EVENT
EVENT.set = function(id, newData, success, error) {
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

    DBAdapter.update(EVENT.name, data, successCB, errorCB);
};

// Add the other functions here


