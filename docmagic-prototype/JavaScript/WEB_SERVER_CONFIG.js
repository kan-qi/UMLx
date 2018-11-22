
var WEB_SERVER_CONFIG = {};

WEB_SERVER_CONFIG.name = "WEB_SERVER_CONFIG";              // Model name

WEB_SERVER_CONFIG.attributes = [            // Model attribute list
    "ValidateXML", "DSIPoolID", "DAPoolID", "CalculationPoolId", "AccountingPoolID", "DTDHostURL", "FillmagicURL", "PrintManagerURL", "BridgeURL", "AccountingURL", "SolrURL", "RequestHandlerDisabled", "RequestHandlerRetryLimit", "RequestHandlerPoolID", "RequestHandlerDebug", "RequestHandlerTimeOut", "SyncDataStoreHost", "GlobalShareLocation", "MailProtocol", "MailHost", "ServiceConfiguration"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_SERVER_CONFIG
WEB_SERVER_CONFIG.create = function(data, success, error) {
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

    DBAdapter.create(WEB_SERVER_CONFIG.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_SERVER_CONFIG, must be 24 character hex string 
WEB_SERVER_CONFIG.get = function(id, success, error) {
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

    DBAdapter.get(WEB_SERVER_CONFIG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_SERVER_CONFIG.read = function(data, success, error) {
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

    DBAdapter.read(WEB_SERVER_CONFIG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_SERVER_CONFIG, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_SERVER_CONFIG.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_SERVER_CONFIG.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_SERVER_CONFIG.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_SERVER_CONFIG.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_SERVER_CONFIG, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_SERVER_CONFIG
WEB_SERVER_CONFIG.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_SERVER_CONFIG.name, data, successCB, errorCB);
};

// Add the other functions here


