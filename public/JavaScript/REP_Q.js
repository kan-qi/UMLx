
var REP_Q = {};

REP_Q.name = "REP_Q";              // Model name

REP_Q.attributes = [            // Model attribute list
    "ReplicationQueueId", "PublishDate", "PublishTime", "UserID", "Action", "FilePath", "PublisherVersion"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in REP_Q
REP_Q.create = function(data, success, error) {
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

    DBAdapter.create(REP_Q.name, data, successCB, errorCB);
};


// "id" : the ObjectId of REP_Q, must be 24 character hex string 
REP_Q.get = function(id, success, error) {
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

    DBAdapter.get(REP_Q.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
REP_Q.read = function(data, success, error) {
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

    DBAdapter.read(REP_Q.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REP_Q, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
REP_Q.update = function(id, update, success, error) {
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

    DBAdapter.update(REP_Q.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
REP_Q.delete = function(data, success, error) {
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

    DBAdapter.delete(REP_Q.name, data, successCB, errorCB);
};

// "id" : the ObjectId of REP_Q, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in REP_Q
REP_Q.set = function(id, newData, success, error) {
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

    DBAdapter.update(REP_Q.name, data, successCB, errorCB);
};

// Add the other functions here


