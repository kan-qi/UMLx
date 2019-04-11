source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.


size_metric_models <- function(model, dataset){

  models = list()
	
	print('ucp testing set predication')
	ucp.m = lm(Effort~UCP, data=otherTrainData)
	ucp.predict = cbind(predicted=predict(ucp.m, otherTestData), actual=otherTestData$Effort)
	
	print('cocomo testing set predication')
	COCOMO_EstimateTestData = otherTestData[!otherTestData$COCOMO_Estimate == 0, ]
	cocomo.predict = cbind(predicted=COCOMO_EstimateTestData$COCOMO_Estimate, actual=COCOMO_EstimateTestData$Effort)
	
	print('fp testing set predication')
	IFPUG.m = lm(Effort~IFPUG, data=otherTrainData)
	IFPUG.predict = cbind(predicted=predict(IFPUG.m, otherTestData), actual=otherTestData$Effort)
	
	print('cocomo apriori testing set predication')
	cocomoAprioriEstimationTestData = otherTestData[!otherTestData$Priori_COCOMO_Estimate == 0,]
	#print(cocomoAprioriEstimationTestData)
	cocomo_apriori.predict = cbind(predicted=cocomoAprioriEstimationTestData$Priori_COCOMO_Estimate, actual=cocomoAprioriEstimationTestData$Effort)
	
	print('fp testing set predication')
	COSMIC.m = lm(Effort~COSMIC, data=otherTrainData)
	COSMIC.predict = cbind(predicted=predict(COSMIC.m, otherTestData), actual=otherTestData$Effort)

	
	print('fp testing set predication')
	MKII.m = lm(Effort~MKII, data=otherTrainData)
	MKII.predict = cbind(predicted=predict(MKII.m, otherTestData), actual=otherTestData$Effort)
	
	print('sloc testing set predication')
	SLOC.m = lm(Effort~KSLOC, data=otherTrainData)
	SLOC.predict = cbind(predicted=predict(SLOC.m, otherTestData), actual=otherTestData$Effort)
	
	print('ln sloc testing set predication')
	otherTrainData$log_effort = log(otherTrainData$Effort)
	otherTrainData$log_sloc = log(otherTrainData$KSLOC)
	SLOC_LN.m = lm(log_effort~log_sloc, data=otherTrainData)
	a = summary(SLOC_LN.m)$coefficients[1,1]
	b = summary(SLOC_LN.m)$coefficients[2,1]
	SLOC_LN.predict = cbind(predicted=otherTestData$KSLOC^b+exp(a), actual=otherTestData$Effort)
	
	return models
	
}
	