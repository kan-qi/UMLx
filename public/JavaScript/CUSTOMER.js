
var CUSTOMER = {};

CUSTOMER.name = "CUSTOMER";              // Model name

CUSTOMER.attributes = [            // Model attribute list
    "CustomerId", "Name", "Address", "City", "State", "Zip", "Phone", "Contact", "StartDate", "Attention", "Fax", "Email", "PartnerID", "InvoiceID", "LeadType", "BillingType", "InvoicePeriod", "InvoiceIncludeFreeLogs", "SummaryInvoiceIndicator", "BillToName", "BillToAddress", "BillToCity", "BillToState", "BillToZip", "CreditCardType", "CreditCardNumber", "CreditCardLast4Digits", "CreditCardData", "CreditCardExpirationMonth", "CreditCardExpirationYear", "CreditCardFirstName", "CreditCardLastName", "CreditCardAddress", "CreditCardZip", "SalesForceLead"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in CUSTOMER
CUSTOMER.create = function(data, success, error) {
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

    DBAdapter.create(CUSTOMER.name, data, successCB, errorCB);
};


// "id" : the ObjectId of CUSTOMER, must be 24 character hex string 
CUSTOMER.get = function(id, success, error) {
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

    DBAdapter.get(CUSTOMER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
CUSTOMER.read = function(data, success, error) {
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

    DBAdapter.read(CUSTOMER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CUSTOMER, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
CUSTOMER.update = function(id, update, success, error) {
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

    DBAdapter.update(CUSTOMER.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
CUSTOMER.delete = function(data, success, error) {
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

    DBAdapter.delete(CUSTOMER.name, data, successCB, errorCB);
};

// "id" : the ObjectId of CUSTOMER, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in CUSTOMER
CUSTOMER.set = function(id, newData, success, error) {
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

    DBAdapter.update(CUSTOMER.name, data, successCB, errorCB);
};

// Add the other functions here


