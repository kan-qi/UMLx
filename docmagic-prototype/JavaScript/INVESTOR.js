
var INVESTOR = {};

INVESTOR.name = "INVESTOR";              // Model name

INVESTOR.attributes = [            // Model attribute list
    "InvestorName", "InvestorShortName", "InvestorStreet", "InvestorCity", "InvestorState", "InvestorZip", "InvestorPhone", "InvestorAssigneeName", "AssigneeStreet", "AssigneeCity", "AssigneeState", "AssigneeZip", "ServicerName", "ServicerStreet", "ServicerCity", "ServicerState", "ServicerZip", "ServicerPhone", "ServicerFromTime", "ServicerToTime", "ServicerDepartmentName", "InvestorLossPayeeName", "InvestorLossPayeeAssignee", "InvestorLossPayeeStreet", "InvestorLossPayeeCity", "InvestorLossPayeeState", "InvestorLossPayeeZip", "InvestorPaymentToName", "InvestorPaymentToStreet", "InvestorPaymentToCity", "InvestorPaymentToState", "InvestorPaymentToZip", "InvestorRecordingName", "InvestorRecordingStreet", "InvestorRecordingCity", "InvestorRecordingState", "InvestorRecordingZip", "InvestorMortgageId", "InvestorShippingName", "InvestorShippingStreet", "InvestorShippingCity", "InvestorShippingState", "InvestorShippingZip", "InvestorMersID"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in INVESTOR
INVESTOR.create = function(data, success, error) {
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

    DBAdapter.create(INVESTOR.name, data, successCB, errorCB);
};


// "id" : the ObjectId of INVESTOR, must be 24 character hex string 
INVESTOR.get = function(id, success, error) {
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

    DBAdapter.get(INVESTOR.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
INVESTOR.read = function(data, success, error) {
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

    DBAdapter.read(INVESTOR.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INVESTOR, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
INVESTOR.update = function(id, update, success, error) {
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

    DBAdapter.update(INVESTOR.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
INVESTOR.delete = function(data, success, error) {
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

    DBAdapter.delete(INVESTOR.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INVESTOR, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in INVESTOR
INVESTOR.set = function(id, newData, success, error) {
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

    DBAdapter.update(INVESTOR.name, data, successCB, errorCB);
};

// Add the other functions here


