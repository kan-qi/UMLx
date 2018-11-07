
var LOAN_APPLICATION = {};

LOAN_APPLICATION.name = "LOAN_APPLICATION";              // Model name

LOAN_APPLICATION.attributes = [            // Model attribute list
    "MISMOVersionID", "FNMConstructionType", "FNMConstructionTypeOtherDescription", "FNMForeignNationalIndicator", "FNM_USCitizenEmployedAbroadIndicator", "FNMTwelveMonthMortgageRolling30DaysLateCount", "FNMPropertiesFinancedByLenderCount", "FNMFirstLienFinancingProviderType", "FNMFirstLienFinancingProviderTypeOtherDescription", "FNMSubordinateLienFinancingProviderType", "FNMSubordinateLienFinancingProviderTypeOtherDescription", "FNMSecondLienFinancingType", "FNMSecondLienFinancingTypeOtherDescription", "FNMFirstLienFinancingType", "FNMFirstLienFinancingTypeOtherDescription", "ArmsLengthIndicator", "BelowMarketSubordinateFinancingIndicator", "BuydownRatePercent", "CaseStateType", "CreditReportAuthorizationIndicator", "CurrentFirstMortgageHolderType", "LenderBranchIdentifier", "LenderRegistrationIdentifier", "PropertyAppraisedValueAmount", "PropertyEstimatedValueAmount", "InvestorLoanIdentifier", "InvestorInstitutionIdentifier", "CommitmentReferenceIdentifier", "ConcurrentOriginationIndicator", "ConcurrentOriginationLenderIndicator", "RateLockPeriodDays", "RateLockType", "RateLockRequestedExtensionDays", "LoanOriginatorID", "LoanOriginationCompanyID", "FNMCommunityLendingProductName", "FNMCommunityLendingProductType", "FNMCommunityLendingProductTypeOtherDescription", "FNMCommunitySecondsIndicator", "FNMCommunitySecondsRepaymentStructure", "FNMNeighborsMortgageEligibilityIndicator", "FREAffordableProgramIdentifier", "HUDIncomeLimitAdjustmentFactor", "HUDLendingIncomeLimitAmount", "HUDMedianIncomeAmount", "MSAIdentifier", "BorrowerFinancedFHADiscountPointsAmount", "FHAAlimonyLiabilityTreatmentType", "FHACoverageRenewalRatePercent", "FHA_MIPremiumRefundAmount", "FHAUpfrontMIPremiumPercent", "_LenderIdentifier", "_SponsorIdentifier", "SectionOfActType", "BorrowerPaidFHA_VAClosingCostsAmount", "BorrowerPaidFHA_VAClosingCostsPercent", "GovernmentMortgageCreditCertificateAmount", "GovernmentRefinanceType", "OtherPartyPaidFHA_VAClosingCostsAmount", "OtherPartyPaidFHA_VAClosingCostsPercent", "PropertyEnergyEfficientHomeIndicator", "SellerPaidFHA_VAClosingCostsPercent", "VABorrowerCoBorrowerMarriedIndicator", "BorrowerFundingFeePercent", "VAEntitlementAmount", "VAMaintenanceExpenseMonthlyAmount", "VAResidualIncomeAmount", "VAUtilityExpenseMonthlyAmount", "HMDAPurposeOfLoanType", "HMDAPreapprovalType", "HMDA_HOEPALoanStatusIndicator", "HMDARateSpreadPercent", "InterviewersEmployerStreetAddress", "InterviewersEmployerCity", "InterviewersEmployerState", "InterviewersEmployerPostalCode", "InterviewersTelephoneNumber", "ApplicationTakenMethodType", "InterviewerApplicationSignedDate", "InterviewersEmployerName", "InterviewersName", "FNMProjectWarrantyType", "FNMProjectWarrantyTypeOtherDescription", "NameDocumentsDrawnInType", "FNMCondominiumCharacteristicsType", "FNMCondominiumCharacteristicsTypeOtherDescription", "AssumabilityIndicator", "BalloonIndicator", "BalloonLoanMaturityTermMonths", "BuydownTemporarySubsidyIndicator", "CounselingConfirmationIndicator", "DownPaymentOptionType", "EscrowWaiverIndicator", "FREOfferingIdentifier", "FNMProductPlanIdentifier", "FNMProductPlanIndentifier", "GSEProjectClassificationType", "GSEPropertyType", "HELOCMaximumBalanceAmount", "HELOCInitialAdvanceAmount", "InterestOnlyTerm", "LenderSelfInsuredIndicator", "LienPriorityType", "LoanDocumentationType", "LoanRepaymentType", "LoanScheduledClosingDate", "MICertificationStatusType", "MICoveragePercent", "MICompanyNameType", "NegativeAmortizationLimitPercent", "PaymentFrequencyType", "PrepaymentPenaltyIndicator", "FullPrepaymentPenaltyOptionType", "PrepaymentPenaltyTermMonths", "PrepaymentRestrictionIndicator", "ProductDescription", "ProductName", "ScheduledFirstPaymentDate", "LoanClosingStatusType", "ServicingTransferStatusType", "AdditionalBorrowerAssetsNotConsideredIndicator", "AdditionalBorrowerAssetsConsideredIndicator", "AgencyCaseIdentifier", "ARMTypeDescription", "BaseLoanAmount", "BorrowerRequestedLoanAmount", "LenderCaseIdentifier", "LoanAmortizationTermMonths", "LoanAmortizationType", "MortgageType", "OtherMortgageTypeDescription", "OtherAmortizationTypeDescription", "RequestedInterestRatePercent", "AlterationsImprovementsAndRepairsAmount", "BorrowerPaidDiscountPointsTotalAmount", "EstimatedClosingCostsAmount", "FNMCostOfLandAcquiredSeparatelyAmount", "MIAndFundingFeeFinancedAmount", "MIAndFundingFeeTotalAmount", "PrepaidItemsEstimatedAmount", "PurchasePriceAmount", "RefinanceIncludingDebtsToBePaidOffAmount", "SalesConcessionAmount", "SellerPaidClosingCostsAmount", "SubordinateLienAmount", "SubordinateLienHELOCAmount", "FREReserveAmount", "FREReservesAmount"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in LOAN_APPLICATION
LOAN_APPLICATION.create = function(data, success, error) {
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

    DBAdapter.create(LOAN_APPLICATION.name, data, successCB, errorCB);
};


// "id" : the ObjectId of LOAN_APPLICATION, must be 24 character hex string 
LOAN_APPLICATION.get = function(id, success, error) {
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

    DBAdapter.get(LOAN_APPLICATION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
LOAN_APPLICATION.read = function(data, success, error) {
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

    DBAdapter.read(LOAN_APPLICATION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_APPLICATION, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
LOAN_APPLICATION.update = function(id, update, success, error) {
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

    DBAdapter.update(LOAN_APPLICATION.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
LOAN_APPLICATION.delete = function(data, success, error) {
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

    DBAdapter.delete(LOAN_APPLICATION.name, data, successCB, errorCB);
};

// "id" : the ObjectId of LOAN_APPLICATION, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in LOAN_APPLICATION
LOAN_APPLICATION.set = function(id, newData, success, error) {
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

    DBAdapter.update(LOAN_APPLICATION.name, data, successCB, errorCB);
};

// Add the other functions here


