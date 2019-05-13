
var Loan = {};

Loan.name = "Loan";              // Model name

Loan.attributes = [            // Model attribute list
    "UniversalLoanIdentifier", "TrusteeRecordPriorTo", "TrusteeFeePercent", "InvestorTransferTo", "TableFunded", "SubordinateFinancingIsNewIndicator", "SigningDate", "SalesContractDate", "RelationshipType", "RecissionDate", "RateLockDays", "Purpose", "Program", "ProcessorName", "PriceLockExpirationDays", "PrepaymentPenalty", "PreliminaryCommitmentDate", "PhhTier", "PackageType", "OwnerOccupied", "OriginatingBrokerLicense", "OfficerLicense", "Officer", "OddDaysInterestPaidBy", "OddDaysGfe", "OccupancyStatus", "NumberAlternate", "Number", "NoEscrowReason", "MinorType", "MersMin", "LoStateLicense", "LoPhone", "LoFax", "LoEmail", "LoCompensation", "LockInDate", "LockExpirationDate", "LienPosition", "LenderRequiresEscrows", "LendersEmail", "LenderPaidIncludeIn", "LenderCredit", "IsPmi", "IsPayoffs", "IsInvestor", "IsHeloc", "IsEscrow", "IsCoop", "IsBuydown", "Investor", "InterestRateAvailableThroughTimeZone", "InterestRateAvailableThrough", "IntentToProceedDate", "HMDAGovernmentMonitoringConformingYearType", "HighCost", "GfeLine2", "GfeLine1", "GfeDate", "FloodZone", "FannieCaseId", "FreddieCaseId", "EstimateAvailableThroughTimeZone", "EstimateAvailableThrough", "DtiRatio", "DisclosureIssuedDate", "DisbursementDate", "Customer", "CostToCure", "ContactName", "CommitmentReturnDays", "CommitmentNumberTitle", "CommitmentNumberSettlementAgent", "CommitmentNumberEscrow", "CommitmentExpiresDate", "ClosingThrough", "ClosingState", "ClosingPostalCode", "ClosingInTrust", "ClosingDateAnticipated", "ClosingDate", "ClosingCounty", "ClosingCity", "ClosingAddress", "CloserPhone", "CloserName", "CloserFax", "Broker", "AreYouA", "ApplicationNumber", "ApplicationDate", "AltLender", "AltaPolicyExceptions", "AltaPolicyEndorsements", "AbilityToRepayBusinessPurposeLoanIndicator", "Borrower", "CustomQuestion", "Fee", "Provider", "Transcript"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in Loan
Loan.create = function(data, success, error) {
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

    DBAdapter.create(Loan.name, data, successCB, errorCB);
};


// "id" : the ObjectId of Loan, must be 24 character hex string 
Loan.get = function(id, success, error) {
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

    DBAdapter.get(Loan.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
Loan.read = function(data, success, error) {
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

    DBAdapter.read(Loan.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Loan, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
Loan.update = function(id, update, success, error) {
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

    DBAdapter.update(Loan.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
Loan.delete = function(data, success, error) {
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

    DBAdapter.delete(Loan.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Loan, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in Loan
Loan.set = function(id, newData, success, error) {
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

    DBAdapter.update(Loan.name, data, successCB, errorCB);
};

// Add the other functions here


