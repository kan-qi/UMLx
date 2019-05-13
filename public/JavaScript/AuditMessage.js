
var AuditMessage = {};

AuditMessage.name = "AuditMessage";              // Model name

AuditMessage.attributes = [            // Model attribute list
    
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in AuditMessage
AuditMessage.create = function(data, success, error) {
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

    DBAdapter.create(AuditMessage.name, data, successCB, errorCB);
};


// "id" : the ObjectId of AuditMessage, must be 24 character hex string 
AuditMessage.get = function(id, success, error) {
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

    DBAdapter.get(AuditMessage.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
AuditMessage.read = function(data, success, error) {
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

    DBAdapter.read(AuditMessage.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AuditMessage, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
AuditMessage.update = function(id, update, success, error) {
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

    DBAdapter.update(AuditMessage.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
AuditMessage.delete = function(data, success, error) {
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

    DBAdapter.delete(AuditMessage.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AuditMessage, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in AuditMessage
AuditMessage.set = function(id, newData, success, error) {
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

    DBAdapter.update(AuditMessage.name, data, successCB, errorCB);
};

// Add the other functions here


