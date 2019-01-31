
var INDEX = {};

INDEX.name = "INDEX";              // Model name

INDEX.attributes = [            // Model attribute list
    "IndexDescription", "IndexRate", "IndexLastUpdated", "IndexFullDescription", "IndexMaturityMonths", "IndexFound", "IndexCurrentDescription", "WebServiceRateType", "WebServiceSelector", "MonthlyHistory", "FullHistoryIndicator"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in INDEX
INDEX.create = function(data, success, error) {
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

    DBAdapter.create(INDEX.name, data, successCB, errorCB);
};


// "id" : the ObjectId of INDEX, must be 24 character hex string 
INDEX.get = function(id, success, error) {
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

    DBAdapter.get(INDEX.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
INDEX.read = function(data, success, error) {
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

    DBAdapter.read(INDEX.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INDEX, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
INDEX.update = function(id, update, success, error) {
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

    DBAdapter.update(INDEX.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
INDEX.delete = function(data, success, error) {
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

    DBAdapter.delete(INDEX.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INDEX, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in INDEX
INDEX.set = function(id, newData, success, error) {
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

    DBAdapter.update(INDEX.name, data, successCB, errorCB);
};

// Add the other functions here


