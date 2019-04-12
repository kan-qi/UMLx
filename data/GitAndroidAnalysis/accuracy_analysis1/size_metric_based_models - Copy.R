source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.


size_metric_models <- function(model, dataset){
  
  #otherSizeMetricsData=modelData[c("Effort", "KSLOC", "COCOMO_Estimate", "Priori_COCOMO_Estimate", "UCP", "IFPUG", "MKII", "COSMIC")]
  #otherSizeMetricsData <- na.omit(otherSizeMetricsData)

  models = list()
	
	print('ucp size metric based model')
	ucp.train = function(trainData){
	  ucp.m = lm(Effort~UCP, data=trainData)
	}
	ucp.predict = function(testData){
	  predict(ucp.m, testData)
	}
	models[["ucp"]] = ucp
	
	
	print('cocomo testing set predication')
	COCOMO_EstimateTestData = otherTestData[!otherTestData$COCOMO_Estimate == 0, ]
	cocomo.predict = cbind(predicted=COCOMO_EstimateTestData$COCOMO_Estimate, actual=COCOMO_EstimateTestData$Effort)
	
	print('ucp size metric based model')
	ucp.train = function(trainData){
	  ucp.m = lm(Effort~UCP, data=trainData)
	}
	ucp.predict = function(testData){
	  predict(ucp.m, testData)
	}
	models[["cocomo"]] = cocomo
	
	print('fp testing set predication')
	IFPUG.m = lm(Effort~IFPUG, data=otherTrainData)
	IFPUG.predict = cbind(predicted=predict(IFPUG.m, otherTestData), actual=otherTestData$Effort)
	models[["ifpug"]] == IFPUG
	
	print('cocomo apriori testing set predication')
	cocomoAprioriEstimationTestData = otherTestData[!otherTestData$Priori_COCOMO_Estimate == 0,]
	#print(cocomoAprioriEstimationTestData)
	cocomo_apriori.predict = cbind(predicted=cocomoAprioriEstimationTestData$Priori_COCOMO_Estimate, actual=cocomoAprioriEstimationTestData$Effort)
	models[["apriori"]] = cocomo.apriori
	
	
	print('fp testing set predication')
	COSMIC.m = lm(Effort~COSMIC, data=otherTrainData)
	COSMIC.predict = cbind(predicted=predict(COSMIC.m, otherTestData), actual=otherTestData$Effort)
	models[["cosmic"]] = cosmic

	
	print('fp testing set predication')
	MKII.m = lm(Effort~MKII, data=otherTrainData)
	MKII.predict = cbind(predicted=predict(MKII.m, otherTestData), actual=otherTestData$Effort)
	models[["mkII"]] = MKII
	
	print('sloc testing set predication')
	SLOC.m = lm(Effort~KSLOC, data=otherTrainData)
	SLOC.predict = cbind(predicted=predict(SLOC.m, otherTestData), actual=otherTestData$Effort)
	models[["sloc"]] = sloc
	
	print('ln sloc testing set predication')
	otherTrainData$log_effort = log(otherTrainData$Effort)
	otherTrainData$log_sloc = log(otherTrainData$KSLOC)
	SLOC_LN.m = lm(log_effort~log_sloc, data=otherTrainData)
	a = summary(SLOC_LN.m)$coefficients[1,1]
	b = summary(SLOC_LN.m)$coefficients[2,1]
	SLOC_LN.predict = cbind(predicted=otherTestData$KSLOC^b+exp(a), actual=otherTestData$Effort)
	models[["sloc_ln"]] = sloc_ln
	
	models
	
}
	