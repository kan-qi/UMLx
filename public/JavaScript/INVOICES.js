
var INVOICES = {};

INVOICES.name = "INVOICES";              // Model name

INVOICES.attributes = [            // Model attribute list
    "InvoiceID", "incollection", "InvoiceLenderNumber", "BillToName", "BillToStreet", "BillToCity", "BillToState", "BillToZip", "Phone", "OrderedBy", "InvoiceDate", "BillingStartDate", "BillingEndDate", "InvoiceShipVia___", "GFSReferenceIdentifier", "Terms", "Notes", "DocMagicCurrentTotalDueAmount", "LoanMagicCurrentTotalDueAmount", "InvoiceTotal", "TotalPayments", "TotalDue", "TotalDiscount", "DiscountPercent", "InvoiceGrossTotal", "PaidDate", "Current", "to30", "to60", "to90", "over90", "total", "AccountFrozen", "BillingPeriod", "InvoiceTransSummary", "InvoicePrintedNotes"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in INVOICES
INVOICES.create = function(data, success, error) {
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

    DBAdapter.create(INVOICES.name, data, successCB, errorCB);
};


// "id" : the ObjectId of INVOICES, must be 24 character hex string 
INVOICES.get = function(id, success, error) {
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

    DBAdapter.get(INVOICES.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
INVOICES.read = function(data, success, error) {
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

    DBAdapter.read(INVOICES.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INVOICES, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
INVOICES.update = function(id, update, success, error) {
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

    DBAdapter.update(INVOICES.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
INVOICES.delete = function(data, success, error) {
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

    DBAdapter.delete(INVOICES.name, data, successCB, errorCB);
};

// "id" : the ObjectId of INVOICES, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in INVOICES
INVOICES.set = function(id, newData, success, error) {
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

    DBAdapter.update(INVOICES.name, data, successCB, errorCB);
};

// Add the other functions here


