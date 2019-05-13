
var AdvancedData = {};

AdvancedData.name = "AdvancedData";              // Model name

AdvancedData.attributes = [            // Model attribute list
    "ThirdPartyID", "ClientID", "ClientName", "Password", "Timestamp", "Method", "StatusUpdate", "OrderDate", "OrderTime", "ThirdPartyOrderID", "form_1040", "form_W2", "form_1099", "form_1065", "form_1120", "TranscriptFile", "ReturnTranscript", "AccountTranscript", "RecordofAccount", "Period1", "Period2", "Period3", "Period4", "CCEmails", "Notes", "LoanNum", "LoanOfficer", "LoanProcessor"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in AdvancedData
AdvancedData.create = function(data, success, error) {
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

    DBAdapter.create(AdvancedData.name, data, successCB, errorCB);
};


// "id" : the ObjectId of AdvancedData, must be 24 character hex string 
AdvancedData.get = function(id, success, error) {
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

    DBAdapter.get(AdvancedData.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
AdvancedData.read = function(data, success, error) {
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

    DBAdapter.read(AdvancedData.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AdvancedData, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
AdvancedData.update = function(id, update, success, error) {
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

    DBAdapter.update(AdvancedData.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
AdvancedData.delete = function(data, success, error) {
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

    DBAdapter.delete(AdvancedData.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AdvancedData, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in AdvancedData
AdvancedData.set = function(id, newData, success, error) {
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

    DBAdapter.update(AdvancedData.name, data, successCB, errorCB);
};

// Add the other functions here


