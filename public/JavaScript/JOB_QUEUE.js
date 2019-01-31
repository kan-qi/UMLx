
var JOB_QUEUE = {};

JOB_QUEUE.name = "JOB_QUEUE";              // Model name

JOB_QUEUE.attributes = [            // Model attribute list
    "LogId", "WorksheetNumber", "DateReceived", "TimeReceived", "Status", "LoanNumber", "PackageType", "IssueDate", "EnvelopeType", "EnvelopeReturnType", "Immediate", "GFSReferenceIdentifier", "JobId", "Copies", "Task", "DeliveryInfo", "WebDocsId", "TransactionId", "Printer", "LabelIdList", "ErrorIndicator", "ErrorDescription", "Format"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in JOB_QUEUE
JOB_QUEUE.create = function(data, success, error) {
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

    DBAdapter.create(JOB_QUEUE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of JOB_QUEUE, must be 24 character hex string 
JOB_QUEUE.get = function(id, success, error) {
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

    DBAdapter.get(JOB_QUEUE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
JOB_QUEUE.read = function(data, success, error) {
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

    DBAdapter.read(JOB_QUEUE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of JOB_QUEUE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
JOB_QUEUE.update = function(id, update, success, error) {
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

    DBAdapter.update(JOB_QUEUE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
JOB_QUEUE.delete = function(data, success, error) {
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

    DBAdapter.delete(JOB_QUEUE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of JOB_QUEUE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in JOB_QUEUE
JOB_QUEUE.set = function(id, newData, success, error) {
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

    DBAdapter.update(JOB_QUEUE.name, data, successCB, errorCB);
};

// Add the other functions here


