
var WS = {};

WS.name = "WS";              // Model name

WS.attributes = [            // Model attribute list
    "DocType", "WorksheetNumber", "LenderNumber", "LoanType", "LoanPurpose", "LienPriorityType", "RefinanceCashOut", "RateType", "PlanCode", "LoanNumber", "MersMinNumber", "MersPurchaserOrgID", "FHAVACaseNumber", "FHASectionNumber", "AgencyCaseIdentifierAssignmentDate", "PreDiscountedInterestRatePercent", "InterestRateDeterminationDate", "CreditorServicingOfLoanStatementType", "LoanCommitmentDate", "LoanCommitmentExpirationDate", "LoanTotalInterestPercent", "IntentToProceedDate", "RateLockExpirationDatetime", "RateLockExpirationTimeZoneType", "EstimatedClosingCostsExpirationDatetime", "EstimatedClosingCostsExpirationTimeZoneType", "MISMOVersionNumber", "WorksheetImport", "DataSourceName", "DataSourceID", "CallbackURL", "CallbackToken", "DocumentDate", "ClosingDate", "SigningDate", "RateLockDate", "RateLockExpirationDate", "LoanProceedsTo", "LoanRep", "LoanRepPhone", "LoanRepFax", "LoanRepEmail", "LoanOriginatorType", "DemandFeatureIndicator", "SubordinateFinancingIsNewIndicator", "HMDAGovernmentMonitoringConformingYearType", "PropertyInspectionWaiverIndicator", "CustomData", "LoanRepLicenseInfo", "Branch", "BranchStreet", "BranchCity", "BranchState", "BranchZip", "BranchPhone", "BranchFax", "BranchEmail", "BranchContact", "BranchLicenseInfo", "CorporationTrustName", "EntityTrustName", "CorporationTrustID", "EntityTrustID", "CorporationTrustState", "EntityTrustState", "EntityType", "EntityFormationDate", "Borrower", "Entity", "MailingStreet", "MailingCity", "MailingState", "MailingZip", "MailingProvinceName", "MailingCountryCode", "SellerCorporationTrustName", "SellerName", "SellerStreet", "SellerCity", "SellerState", "SellerZip", "SellerProvinceName", "SellerCountryCode", "Seller", "ParsedName", "ServiceProvider", "BrokerName", "BrokerStreet", "BrokerCity", "BrokerState", "BrokerZip", "BrokerPhone", "BrokerContact", "BrokerFax", "BrokerEmail", "BrokerLicenseNumber", "ClosingCounty", "ClosingCity", "TitleReportDate", "ParcelNumber", "Lot", "Block", "Tract", "Unit", "Book", "Page", "InstrumentNo", "TaxMessage", "SpecialEndorsements", "ApprovedItems", "PropertyStreet", "PropertyCity", "PropertyCounty", "PropertyArea", "PropertyState", "PropertyZip", "StructureBuiltYear", "PropertyEstateType", "GroundLeaseExpirationDate", "OwnerOccupied", "PropertyType", "FloodZone", "SecondHome", "BuildingStatusType", "CondominiumPudName", "ProjectName", "LegalDescriptionAttached", "LegalDescription", "PropertyFinancedUnitCount", "PropertyAcquisitionDate", "PropertyAcquisitionCostAmount", "PropertyEstimatedValueAmount", "HMDAPropertyLegalClassificationType", "AppraisedValue", "SalesPrice", "TotalSalesPrice", "Approved2ndLien", "LoanAmount", "BaseLoanAmount", "FHAUpfrontMIPremiumPercent", "FHAMIRenewalPremiumPercent", "MaximumPrepaymentPenaltyAmount", "InterestRate", "Term", "Amortization", "InitialPayment", "FirstPaymentDate", "InterestChangeDate", "PaymentChangeDate", "InterestRateCeiling", "InterestRateFloor", "Margin", "DaysPrepaidInterest", "GFEDisclosedPrepaidInterestAmount", "GFEDisclosureDate", "InterestChangeCap", "LifetimeInterestChangeCap", "PerDiemInterestDays", "IndexCode", "InterestChangeMonths", "PaymentChangeMonths", "PaymentChangeCapPercentage", "ARMRecastPercentage", "RecastMonths", "InitialAdvance", "DrawPeriod", "RepayPeriod", "AnnualFee", "Termite", "Compliance", "PrepaymentPenalty", "Assumable", "DeficiencyRightsPreservedIndicator", "ClosingConditions", "SoftPrepaymentPenaltyMonths", "PrepaymentPenaltyMonths", "PrepaymentAdvancedInterestMonths", "PrepaymentPenaltyPercent", "PrepaymentFeesOnPreviousLoan", "AlternateLenderNumber", "GpmType", "BuydownType", "DisbursementDate", "ApprovalExpirationDate", "RateAvailableThroughDate", "RateAvailableThroughTime", "RateLockDays", "RateLockMinimumDaysPriorToSettlement", "SettlementEstimateAvailableThroughDate", "GFELoanOriginatorFeePaymentCreditType", "FinalRelationship", "PackageType", "LastUniqueFeeIdentifier", "Charge", "LoanFee", "Impound", "ImpoundAccountCushionAmount", "ImpoundAccountInitialBalanceAmount", "ImpoundAccountMonthlyPaymentAmount", "ImpoundAccountLowBalanceAmount", "GFEDisclosedInitialDeposit", "ImpoundsRequired", "ImpoundAccountItem", "PMI1stYearPremium", "PMI1stYearPremiumRate", "MIPremiumRefundableType", "ExcludeMIRelatedPayments", "PMIMMIMonthlyAmount", "PMIMMIMonths", "MICushionMonthsCount", "MICertificateIdentifier", "MIRenewalCalculationType", "PMIDecliningFactor", "MIRenewalRate1", "MIRenewalTerm1", "MIRenewalRate2", "MIRenewalTerm2", "PMIMonthlyTotal", "TotalPMI", "MIAnnualFee", "TransferTo", "FirstInterestChangeCap", "PMIMMIDueDate", "LateChargePercentage", "LateChargeDays", "LateChargeAmount", "LateChargeCode", "LateChargeMaxAmount", "VestingToRead", "PMIEndDate", "Section32HighFeePercent", "Section32Index", "ImpoundCushionAmount", "WSImpoundCushionMonths", "PerDiemInterest", "PrepaidInterest", "ConstructionInterest", "MITotalMonthlyPaymentsAmount", "MITotalPaymentAmount", "TotalPrepaidCharges", "PrepaidFinanceCharge", "NonPrepaidCharges", "TotalReserves", "AmountPaidToOthers", "Payment", "InitialPaymentToInterestAmount", "InitialPaymentToPrincipalAmount", "TotalOfPayments", "AmountFinanced", "FinanceCharge", "AmountPaidDirectly", "AprPrincipal", "PrepaidMonths", "AnnualPercentageRate", "InterestStartDate", "FinalPaymentDate", "GraduatedPayment", "HighPrincipalBalance", "HighPrincipalMonth", "LoanToValueRatio", "CombinedLoanToValueRatio", "AggregateAdjustment", "ApplicationDate", "Index", "CancelDate", "Premium", "BuydownDetail", "Payoff", "MineralRightsDescription", "PrepaidInterestPaidBy", "ImpoundsPaidBy", "BiWeeklyIndicator", "PMIPaidBy", "ConventionalPrepaymentPenalty", "Section32", "PriorLien", "HUDItem", "LastSaveUser", "LastSaveTime", "LastSaveDate", "SoftwareType", "SoftwareVersion", "PartnerId", "Status", "LoanStageType", "AltDeliveryType", "ConstructionRate", "ConstructionTermMonths", "ConstructionCashToCloseAmount", "ConstructionCostAmount", "LandOriginalCostAmount", "WebDocsCode", "WebDocsType", "Language", "LienHolderSameAsSubjectLoanIndicator", "PartialPaymentAcceptanceType", "OriginationChannelType", "ApartmentNumber", "ClosingState", "MERSIsMortgageeOfRecord", "LicenseInfo", "LoanIdentifier", "LoanComment", "InitialPaymentRate", "InitialPaymentDiscountPercent", "LOSProgramFeature", "GFEComparison", "ClosingCondition", "LoanManualUnderwritingIndicator", "FNMCommunityLendingProductType", "AutomatedUnderwriting", "LoanOptionComparisonItem", "Asset", "DownPayment", "Liability", "HousingExpense", "PurchaseCredit", "HomeOwnershipCounselingZipCodeToUse", "PrepaidItem", "TaxTranscript", "Party", "ProposedServiceProvider"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in WS
WS.create = function(data, success, error) {
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

    DBAdapter.create(WS.name, data, successCB, errorCB);
};


// "id" : the ObjectId of WS, must be 24 character hex string 
WS.get = function(id, success, error) {
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

    DBAdapter.get(WS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
WS.read = function(data, success, error) {
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

    DBAdapter.read(WS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
WS.update = function(id, update, success, error) {
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

    DBAdapter.update(WS.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
WS.delete = function(data, success, error) {
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

    DBAdapter.delete(WS.name, data, successCB, errorCB);
};

// "id" : the ObjectId of WS, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in WS
WS.set = function(id, newData, success, error) {
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

    DBAdapter.update(WS.name, data, successCB, errorCB);
};

// Add the other functions here


