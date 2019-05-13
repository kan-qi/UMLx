
var SCREENS = {};

SCREENS.name = "SCREENS";              // Model name

SCREENS.attributes = [            // Model attribute list
    "ScreenName", "DataFileName", "DictionaryFile", "WindowBoxPos", "DictionaryId", "LastKeyXYPos_", "LastkeyFileItem", "AutoIdPrefix", "PrintScreenSub", "ReversePrompts", "DisplayOnly", "SinglelineHelpXY", "MultiPartIdSeparator", "AllowPartialID_", "MiscellaneousDisplays", "PreInputSubroutine", "PostInputSubroutine", "AllowExtraSeparators", "MinimumSecurityLevel"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in SCREENS
SCREENS.create = function(data, success, error) {
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

    DBAdapter.create(SCREENS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of SCREENS, must be 24 character hex string 
SCREENS.get = function(id, success, error) {
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

    DBAdapter.get(SCREENS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
SCREENS.read = function(data, success, error) {
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

    DBAdapter.read(SCREENS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of SCREENS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
SCREENS.update = function(id, update, success, error) {
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

    DBAdapter.update(SCREENS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
SCREENS.delete = function(data, success, error) {
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

    DBAdapter.delete(SCREENS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of SCREENS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in SCREENS
SCREENS.set = function(id, newData, success, error) {
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

    DBAdapter.update(SCREENS.name, data, successCB, errorCB);
};

// Add the other functions here


