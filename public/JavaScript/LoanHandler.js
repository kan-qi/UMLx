
var LoanHandler = {};

LoanHandler.name = "LoanHandler";              // Model name

LoanHandler.attributes = [            // Model attribute list
    "1", "2", "3", "324", "18", "189", "32", "1050", "752", "760", "746", "744", "747", "4", "681", "762", "697", "422", "419", "676", "420", "1040", "1294", "1011", "1297", "760", "761", "3528", "331", "332", "352", "1210", "607", "1171", "304", "363", "1039", "1108", "135", "136", "137", "139", "142", "330", "966", "967", "1044", "1091", "34", "99", "355", "431", "351", "990", "1132", "1065", "1033", "1150", "19", "20", "9", "21", "22", "23", "24", "25", "26", "28", "29", "204", "190", "1084", "", "983", "739", "741", "975", "1085", "1038", "1159", "1106", "1197", "1198", "1199", "1200", "1201", "1202", "1208", "180", "478", "557", "211", "212"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LoanHandler
LoanHandler.create = function(data, success, error) {
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

    DBAdapter.create(LoanHandler.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LoanHandler, must be 24 character hex string 
LoanHandler.get = function(id, success, error) {
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

    DBAdapter.get(LoanHandler.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LoanHandler.read = function(data, success, error) {
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

    DBAdapter.read(LoanHandler.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LoanHandler, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LoanHandler.update = function(id, update, success, error) {
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

    DBAdapter.update(LoanHandler.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LoanHandler.delete = function(data, success, error) {
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

    DBAdapter.delete(LoanHandler.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LoanHandler, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LoanHandler
LoanHandler.set = function(id, newData, success, error) {
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

    DBAdapter.update(LoanHandler.name, data, successCB, errorCB);
};

// Add the other functions here


