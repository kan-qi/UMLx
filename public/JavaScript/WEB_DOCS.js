
var WEB_DOCS = {};

WEB_DOCS.name = "WEB_DOCS";              // Model name

WEB_DOCS.attributes = [            // Model attribute list
    "Worksheet", "WebDocsCode", "PackageType", "RequestDate", "RequestTime", "Password", "ExpirationDate", "PasswordType", "GFSId", "GFSVersionId", "DisablePrinting", "AttachmentId", "WatermarkDescription", "GroupId", "UCDFileGFSId", "ClosingDisclosureIncludedIndicator"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WEB_DOCS
WEB_DOCS.create = function(data, success, error) {
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

    DBAdapter.create(WEB_DOCS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WEB_DOCS, must be 24 character hex string 
WEB_DOCS.get = function(id, success, error) {
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

    DBAdapter.get(WEB_DOCS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WEB_DOCS.read = function(data, success, error) {
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

    DBAdapter.read(WEB_DOCS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_DOCS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WEB_DOCS.update = function(id, update, success, error) {
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

    DBAdapter.update(WEB_DOCS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WEB_DOCS.delete = function(data, success, error) {
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

    DBAdapter.delete(WEB_DOCS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WEB_DOCS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WEB_DOCS
WEB_DOCS.set = function(id, newData, success, error) {
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

    DBAdapter.update(WEB_DOCS.name, data, successCB, errorCB);
};

// Add the other functions here


