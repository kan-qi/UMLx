
var ORDER_TYPE = {};

ORDER_TYPE.name = "ORDER_TYPE";              // Model name

ORDER_TYPE.attributes = [            // Model attribute list
    "Description", "Freeif0", "Service", "BillingCycle", "Subscription", "Core", "SalesForceProductId", "InvoiceTransSummaryGroupingCode", "InvoiceTransSummaryRankingValue", "InvoiceTransSummaryPriceSubstituteTextFlag", "InvoiceTransSummaryPriceSubstituteText", "InvoiceTransSummaryDetailSuppressFlag", "InvoiceTransSummaryExclude"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in ORDER_TYPE
ORDER_TYPE.create = function(data, success, error) {
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

    DBAdapter.create(ORDER_TYPE.name, data, successCB, errorCB);
};


// "id" : the ObjectId of ORDER_TYPE, must be 24 character hex string 
ORDER_TYPE.get = function(id, success, error) {
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

    DBAdapter.get(ORDER_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
ORDER_TYPE.read = function(data, success, error) {
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

    DBAdapter.read(ORDER_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ORDER_TYPE, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
ORDER_TYPE.update = function(id, update, success, error) {
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

    DBAdapter.update(ORDER_TYPE.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
ORDER_TYPE.delete = function(data, success, error) {
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

    DBAdapter.delete(ORDER_TYPE.name, data, successCB, errorCB);
};

// "id" : the ObjectId of ORDER_TYPE, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in ORDER_TYPE
ORDER_TYPE.set = function(id, newData, success, error) {
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

    DBAdapter.update(ORDER_TYPE.name, data, successCB, errorCB);
};

// Add the other functions here


