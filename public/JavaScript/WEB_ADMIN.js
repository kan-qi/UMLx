
var WEB_ADMIN = {};

WEB_ADMIN.name = "WEB_ADMIN";              // Model name

WEB_ADMIN.attributes = [            // Model attribute list
    "User", "DataSource", "CustomEmail", "WriteESignGFSIndicator", "UseEVaultIndicator", "DocumentStorageType", "EmailHdr", "UserIpFilter", "WebDocsIpFilter", "EnableTiming", "UseJavaDocumentProcessing", "ESignProcessingVersion", "DebugLevel", "SinglePassProcessingIndicator", "PasswordHistoryLimit", "PasswordExpirationDuration", "EncryptPassword", "GlobalService", "BrandingId", "PartnerId", "BlitzDocsGUID", "WSPurgeDays", "WSPurgeHistDays", "ProviderOption", "ServiceConfiguration", "PackageTypeConfiguration", "SaturdayBusinessIndicator", "SaturdayBusinessClosedIndicator", "BusinessDaysClosed", "DocMagicApplicationAbsoluteURIIndicator", "NotificationHTTPHeader", "NotificationConfiguration"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_ADMIN
WEB_ADMIN.create = function(data, success, error) {
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

    DBAdapter.create(WEB_ADMIN.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_ADMIN, must be 24 character hex string 
WEB_ADMIN.get = function(id, success, error) {
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

    DBAdapter.get(WEB_ADMIN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_ADMIN.read = function(data, success, error) {
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

    DBAdapter.read(WEB_ADMIN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_ADMIN, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_ADMIN.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_ADMIN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_ADMIN.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_ADMIN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_ADMIN, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_ADMIN
WEB_ADMIN.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_ADMIN.name, data, successCB, errorCB);
};

// Add the other functions here


