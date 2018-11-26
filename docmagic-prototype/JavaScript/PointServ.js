
var PointServ = {};

PointServ.name = "PointServ";              // Model name

PointServ.attributes = [            // Model attribute list
    "OrderID", "LoanNumber", "PrimaryFirstName", "PrimaryMiddleName", "PrimaryLastName", "PrimarySSN", "PrimaryPhone", "PrimaryEmail", "JointFirstName", "JointMiddleName", "JointLastName", "JointSSN", "JointPhone", "JointEmail", "TranscriptRequest"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PointServ
PointServ.create = function(data, success, error) {
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

    DBAdapter.create(PointServ.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PointServ, must be 24 character hex string 
PointServ.get = function(id, success, error) {
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

    DBAdapter.get(PointServ.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PointServ.read = function(data, success, error) {
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

    DBAdapter.read(PointServ.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PointServ, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PointServ.update = function(id, update, success, error) {
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

    DBAdapter.update(PointServ.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PointServ.delete = function(data, success, error) {
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

    DBAdapter.delete(PointServ.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PointServ, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PointServ
PointServ.set = function(id, newData, success, error) {
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

    DBAdapter.update(PointServ.name, data, successCB, errorCB);
};

// Add the other functions here


