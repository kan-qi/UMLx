
var LM_LOG = {};

LM_LOG.name = "LM_LOG";              // Model name

LM_LOG.attributes = [            // Model attribute list
    "LogNumber", "Date", "Time", "PartnerCode", "AccountNumber", "UserName", "SoftwareType", "OrderType", "OrderAmount", "InvoiceNumber"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LM_LOG
LM_LOG.create = function(data, success, error) {
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

    DBAdapter.create(LM_LOG.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LM_LOG, must be 24 character hex string 
LM_LOG.get = function(id, success, error) {
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

    DBAdapter.get(LM_LOG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LM_LOG.read = function(data, success, error) {
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

    DBAdapter.read(LM_LOG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LM_LOG, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LM_LOG.update = function(id, update, success, error) {
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

    DBAdapter.update(LM_LOG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LM_LOG.delete = function(data, success, error) {
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

    DBAdapter.delete(LM_LOG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LM_LOG, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LM_LOG
LM_LOG.set = function(id, newData, success, error) {
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

    DBAdapter.update(LM_LOG.name, data, successCB, errorCB);
};

// Add the other functions here


