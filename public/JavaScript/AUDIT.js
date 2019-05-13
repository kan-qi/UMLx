
var AUDIT = {};

AUDIT.name = "AUDIT";              // Model name

AUDIT.attributes = [            // Model attribute list
    "Description", "AuditType", "MessageCmd", "ApplicableLogic", "ApplicableScript", "AuditLogic", "AuditScript", "LockAudit", "LoanTypes", "States", "DetailsURL", "ReturnPos", "Disposition", "Category", "Tag", "InceptDate", "LastValidationDate", "ValidationMonths", "FirstValidationby", "SecondValidationby"
];

// Model functions

// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in AUDIT
AUDIT.create = function(data, success, error) {
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


//     data = {          // Model attribute list
//     "Description": "test",
//     "AuditType": "test1",
//     "MessageCmd": "test2",
//     "ApplicableLogic": "test3", 
//     "ApplicableScript": "test3", 
//     "AuditLogic": "test3", 
//     "AuditScript": "test3", 
//     "LockAudit": "true", 
//     "LoanTypes": "test3", 
//     "States": "test3", 
//     "DetailsURL": "test3", 
//     "ReturnPos": "3", 
//     "Disposition": "test3", 
//     "Category": "test3", 
//     "Tag": "test3", 
//     "InceptDate": "2018-7-11", 
//     "LastValidationDate": "2017-12-01", 
//     "ValidationMonths": "3", 
//     "FirstValidationby": "2017-12-01", 
//     "SecondValidationby": "2017-12-01"
// };


// data = {
//     "Description": "Description String",
//     "AuditType": "AuditType String",
//     "MessageCmd": "MessageCmd String",
//     "ApplicableLogic": "ApplicableLogic String",
//     "ApplicableScript": "ApplicableScript String",
//     "AuditLogic": "AuditLogic String",
//     "AuditScript": "AuditScript String",
//     "LockAudit": false,
//     "LoanTypes": "LoanTypes String",
//     // "States": "States String",
//     // "DetailsURL": "DetailsURL String",
//     "ReturnPos": 2,
  //   "Disposition": "Disposition String",
  //   "Category": "Category String",
  //   "Tag": "Tag String",
  //   "InceptDate": "2018-03-25T12:00:00.000Z",
  //   "LastValidationDate": "2018-03-25T12:00:00.000Z",
  //   "ValidationMonths": 3,
  //   "FirstValidationby": "FirstValidationby String",
  //   "SecondValidationby": "SecondValidationby String",
  //   "AuditChange": {
  //     "SForceId": "AuditChange String",
  //     "Date": "2018-03-25T12:00:00.000Z",
  //     "Time": "2018-03-25T12:00:00.000Z",
  //     "User": "User String",
  //     "Note_Comment": "Note_Comment String"
  //   }
  // }

  //   console.log(data);

    DBAdapter.create(AUDIT.name, data, successCB, errorCB);
};


// "id" : the ObjectId of AUDIT, must be 24 character hex string 
AUDIT.get = function(id, success, error) {
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

    DBAdapter.get(AUDIT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
AUDIT.read = function(data, success, error) {
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

    DBAdapter.read(AUDIT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AUDIT, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
AUDIT.update = function(id, update, success, error) {
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

    DBAdapter.update(AUDIT.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
AUDIT.delete = function(data, success, error) {
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

    DBAdapter.delete(AUDIT.name, data, successCB, errorCB);
};

// "id" : the ObjectId of AUDIT, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in AUDIT
AUDIT.set = function(id, newData, success, error) {
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

    DBAdapter.update(AUDIT.name, data, successCB, errorCB);
};

// Add the other functions here


