
var PLAN = {};

PLAN.name = "PLAN";              // Model name

PLAN.attributes = [            // Model attribute list
    "PlanDescription", "RateType", "PlanLender", "PlanInvestor", "AssigneeName", "AssigneeAddress", "ServicingTransferName", "ServicingTransferAddress", "ServicingTransferPhone", "PlanLoanType", "ARMFloorIsRate", "ARMIndexCode", "ARMInterestChangeMonths", "ARMPaymentChangeMonths", "ARMFirstInterestChangeMonths", "ARMFirstPaymentChangeMonths", "ARMInterestChangeCap", "ARMInterestCapPeriodMonths", "ARMCapFirstAdjustment", "ARMPaymentChangeCapPercentage", "ARMConversionFee", "ARMRecastLogic", "PlanRecastPercent", "ARMRecastMonths", "ARMRoundTargetRateUp", "ARMRoundAdjustments", "ARMRoundToPercentage", "ARMFirstInterestCap", "ARMAllowDownwardAdjustment", "ARMShowFloorOnNote", "LifeCap", "LateChargeLowPayment", "LateChargeHighPayment", "DemandFeature", "FinalPaymentOnTIL", "StopBuydownOnTIL", "DeferMonths", "ConventionalMIDropOff", "AddPrepaidInterestToFirstPayment", "PerDiemInterestDays", "TwoDigitPerDiemCalculation", "InitialPaymentInterestType", "InitialPaymentType", "InterestTypeOrInterestOnlyMonths", "OtherInterestType", "FullyIndexedPerDiem", "OtherInterestMonths", "BiWeeklyPayment", "BiWeeklyDaysPerYear", "FHAAccelerationMonths", "FHAPrepaymentMonths", "ImpoundCushionMonths", "PmiType", "PMICushionMonths", "SigLineOnAssignment", "NotaryOnAssignment", "DateNotary", "UseLenderStateCountyOnNotary", "RecordConcurrently", "NoteOriginationCityStateType", "NoteEndorsementType", "NoteEndorsementSignerNameTitle", "NoteEndorsementSignerName", "NoteEndorsementSignerTitle", "UseBorrowerInitials", "DocumentInitialType", "UseFeeToCompanyNames", "UseMersNumber", "DocMailEmailAddress", "RecordingDataSourceType", "LossPayeeDataSourceType", "PaymentDataSourceType", "LoanNumberOnRecordables", "HELOCMinimumAdvanceAmount", "HELOCMinimumPaymentAmount", "HELOCMinimumAdvanceBalance", "SubordinateFinancing", "SoftPrepayMonths", "SoftPrepayType", "ShowHUD1Totals", "InitialTerm", "InitialAmort", "InitialPaymentOrAdjustmentRate", "PlanPrepaidDaysInAPR", "InitialPaymentMinimumRate", "Form4506Type", "ProgramIdentifier", "IncludePremiumsInOriginationCharge", "PlanGFEDataToHud1", "PlanOrderEnabled", "MISMOMapping", "PlanLoanOriginatorType", "ClientCalculation", "UpfrontRoundingMethod", "AnnualFeeRoundingMethod", "ImpoundCushionMethod", "DeliveryChannel", "ECOAAgency", "HMDAGovernmentMonitoringInformatonType", "DefaultFontName", "AdvanceFee", "SplitEscrowsFlag"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in PLAN
PLAN.create = function(data, success, error) {
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

    DBAdapter.create(PLAN.name, data, successCB, errorCB);
};


// "id" : the ObjectId of PLAN, must be 24 character hex string 
PLAN.get = function(id, success, error) {
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

    DBAdapter.get(PLAN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
PLAN.read = function(data, success, error) {
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

    DBAdapter.read(PLAN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PLAN, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
PLAN.update = function(id, update, success, error) {
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

    DBAdapter.update(PLAN.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
PLAN.delete = function(data, success, error) {
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

    DBAdapter.delete(PLAN.name, data, successCB, errorCB);
};

// "id" : the ObjectId of PLAN, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in PLAN
PLAN.set = function(id, newData, success, error) {
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

    DBAdapter.update(PLAN.name, data, successCB, errorCB);
};

// Add the other functions here


