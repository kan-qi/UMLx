source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.


compareBetweenSizeMetrics <- function(TNModelData, SWTIIModelData, SWTIIIModelData, otherSizeMetricsData){
  #compareBetweenSizeMetrics <- function(TNModelData, SWTIIModelData, SWTIIIModelData, otherSizeMetricsData, model1, model2, model3){
  
  #useCaseData <- data[c("Effort", "EUCP", "EXUCP", "DUCP")]
  

  # estimate the predication accuracy by n fold cross validation.
  #Randomly shuffle the data
  #useCaseData<-useCaseData[sample(nrow(useCaseData)),]
  #Create 10 equally size folds

  nfold = 5
  folds <- cut(seq(1,nrow(TNModelData)),breaks=nfold,labels=FALSE)

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(nrow=nfold,ncol=44)
colnames(foldResults) <- c(
		'eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50', 
		'exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50',
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50',
		'IFPUG_mmre','IFPUG_pred15','IFPUG_pred25','IFPUG_pred50',
		'MKII_mmre','MKII_pred15','MKII_pred25','MKII_pred50',
		'COSMIC_mmre','COSMIC_pred15','COSMIC_pred25','COSMIC_pred50',
		'SLOC_mmre','SLOC_pred15','SLOC_pred25','SLOC_pred50',
		'SLOC_ln_mmre','SLOC_ln_pred15','SLOC_ln_pred25','SLOC_ln_pred50'
)

foldResults1 <- array(0,dim=c(50,9,nfold))

#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function
  #i = 1
	testIndexes <- which(folds==i,arr.ind=TRUE)
	
	testTNModelData <- TNModelData[testIndexes, ]
	trainTNModelData <- TNModelData[-testIndexes, ]
	
	testSWTIIModelData <- SWTIIModelData[testIndexes, ]
	trainSWTIIModelData <- SWTIIModelData[-testIndexes, ]
	
	testSWTIIIModelData <- SWTIIIModelData[testIndexes, ]
	trainSWTIIIModelData <- SWTIIIModelData[-testIndexes, ]
	
	otherTestData <- otherSizeMetricsData[testIndexes, ]
	otherTrainData <- otherSizeMetricsData[-testIndexes,]
	
	print('eucp testing set predication')
	
	levels1 <- length(trainTNModelData)-1
	normFactor1 <- calNormFactor(trainTNModelData, levels1)
	print(normFactor1)
	
	#normalizedData <- regressionData[rownames(regressionData) != "Aggregate", ]
	#normalizedData$Effort <- normalizedData$Effort/normFactor
	#bayesianModel <- bayesfit(lm(Effort ~ . - 1, normalizedData), 1000)
	
	means1 <- genMeans(levels1)
	#print(means)
	covar1 <- genVariance(means1, 1)
	bayesianModel1 <- bayesfit3(trainTNModelData, 100000, means1, covar1, normFactor1['mean'], normFactor1['var'])
	#bayesianModel1 <- model1
	
	#eucp.mre = apply(testData, 1, function(x))
	eucp.predict = cbind(predicted=predict.blm(bayesianModel1, newdata = testTNModelData), actual=testTNModelData$Effort)
	#print(eucp.predict)
	eucp.mre = apply(eucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	eucp.mmre = mean(eucp.mre)
	#print(eucp.mmre)
	#eucp.preds = sapply(eucp.mre, function(x) calculatePreds(x))
	eucp.pred15 = length(eucp.mre[eucp.mre<=0.15])/length(eucp.mre)
	eucp.pred25 = length(eucp.mre[eucp.mre<=0.25])/length(eucp.mre)
	eucp.pred50 = length(eucp.mre[eucp.mre<=0.50])/length(eucp.mre)
	#print(c(eucp.pred15, eucp.pred25, eucp.pred50))
	
	eucp.pred <- c()
	for(j in 1:50){
		eucp.pred <- c(eucp.pred, length(eucp.mre[eucp.mre<=0.01*j])/length(eucp.mre))
	}
	
	print('exucp testing set predication')
	levels2 <- length(trainSWTIIModelData)-1
	normFactor2 <- calNormFactor(trainSWTIIModelData, levels2)
	#print(normFactor2)
	
	#normalizedData <- regressionData[rownames(regressionData) != "Aggregate", ]
	#normalizedData$Effort <- normalizedData$Effort/normFactor
	#bayesianModel <- bayesfit(lm(Effort ~ . - 1, normalizedData), 1000)
	
	means2 <- genMeans(levels2)
	#print(means)
	covar2 <- genVariance(means2, 1)
	bayesianModel2 <- bayesfit3(trainSWTIIModelData, 100000, means2, covar2, normFactor2['mean'], normFactor2['var'])
	
	#bayesianModel2 <- model2
	
	exucp.predict = cbind(predicted=predict.blm(bayesianModel2, newdata = testSWTIIModelData), actual=testSWTIIModelData$Effort)
	print(exucp.predict)
	exucp.mre = apply(exucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	exucp.mmre = mean(exucp.mre)
	print(exucp.mmre)
	#exucp.preds = sapply(exucp.mre, function(x) calculatePreds(x))
	exucp.pred15 = length(exucp.mre[exucp.mre<=0.15])/length(exucp.mre)
	exucp.pred25 = length(exucp.mre[exucp.mre<=0.25])/length(exucp.mre)
	exucp.pred50 = length(exucp.mre[exucp.mre<=0.50])/length(exucp.mre)
	print(c(exucp.pred15, exucp.pred25, exucp.pred50))
	
	exucp.pred <- c()
	for(j in 1:50){
		exucp.pred <- c(exucp.pred, length(exucp.mre[exucp.mre<=0.01*j])/length(exucp.mre))
	}
	
	print('ducp testing set predication')
	levels3 <- length(trainSWTIIIModelData)-1
	normFactor3 <- calNormFactor(trainSWTIIIModelData, levels3)
	#print(normFactor3)
	#print(levels3)
	#normalizedData <- regressionData[rownames(regressionData) != "Aggregate", ]
	#normalizedData$Effort <- normalizedData$Effort/normFactor
	#bayesianModel <- bayesfit(lm(Effort ~ . - 1, normalizedData), 1000)
	
	means3 <- genMeans(levels3)
	#print(means)
	covar3 <- genVariance(means3, 1)
	bayesianModel3 <- bayesfit3(trainSWTIIIModelData, 100000, means3, covar3, normFactor3['mean'], normFactor3['var'])
	
	#bayesianModel3 <- model3

	
	#ducp.m = lm(Effort~DUCP, data=trainSWTIIIModelData)
	ducp.predict = cbind(predicted=predict.blm(bayesianModel3, newdata = testSWTIIIModelData), actual=testSWTIIIModelData$Effort)
	#print(ducp.predict)
	ducp.mre = apply(ducp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	ducp.mmre = mean(ducp.mre)
	#print(ducp.mmre)
	#ducp.preds = sapply(ducp.mre, function(x) calculatePreds(x))
	ducp.pred15 = length(ducp.mre[ducp.mre<=0.15])/length(ducp.mre)
	ducp.pred25 = length(ducp.mre[ducp.mre<=0.25])/length(ducp.mre)
	ducp.pred50 = length(ducp.mre[ducp.mre<=0.50])/length(ducp.mre)
	#print(c(ducp.pred15, ducp.pred25, ducp.pred50))
	
	ducp.pred <- c()
	for(j in 1:50){
		ducp.pred <- c(ducp.pred, length(ducp.mre[ducp.mre<=0.01*j])/length(ducp.mre))
	}
	
	print('ucp testing set predication')
	ucp.m = lm(Effort~UCP, data=otherTrainData)
	ucp.predict = cbind(predicted=predict(ucp.m, otherTestData), actual=otherTestData$Effort)
	print(ucp.predict)
	ucp.mre = apply(ucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	ucp.mmre = mean(ucp.mre)
	print(ucp.mmre)
	#ucp.preds = sapply(ucp.mre, function(x) calculatePreds(x))
	ucp.pred15 = length(ucp.mre[ucp.mre<=0.15])/length(ucp.mre)
	ucp.pred25 = length(ucp.mre[ucp.mre<=0.25])/length(ucp.mre)
	ucp.pred50 = length(ucp.mre[ucp.mre<=0.50])/length(ucp.mre)
	print(c(ucp.pred15, ucp.pred25, ucp.pred50))
	
	ucp.pred <- c()
	for(j in 1:50){
		ucp.pred <- c(ucp.pred, length(ucp.mre[ucp.mre<=0.01*j])/length(ucp.mre))
	}
	
	print('cocomo testing set predication')
	COCOMO_EstimateTestData = otherTestData[!otherTestData$COCOMO_Estimate == 0, ]
	cocomo.predict = cbind(predicted=COCOMO_EstimateTestData$COCOMO_Estimate, actual=COCOMO_EstimateTestData$Effort)
	#print(cocomo.predict)
	cocomo.mre = apply(cocomo.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	cocomo.mmre = mean(cocomo.mre)
	#print(cocomo.mmre)
	#cocomo.preds = sapply(cocomo.mre, function(x) calculatePreds(x))
	cocomo.pred15 = length(cocomo.mre[cocomo.mre<=0.15])/length(cocomo.mre)
	cocomo.pred25 = length(cocomo.mre[cocomo.mre<=0.25])/length(cocomo.mre)
	cocomo.pred50 = length(cocomo.mre[cocomo.mre<=0.50])/length(cocomo.mre)
	#print(c(cocomo.pred15, cocomo.pred25, cocomo.pred50))
	
	cocomo.pred <- c()
	for(j in 1:50){
		cocomo.pred <- c(cocomo.pred, length(cocomo.mre[cocomo.mre<=0.01*j])/length(cocomo.mre))
	}
	
	print('fp testing set predication')
	IFPUG.m = lm(Effort~IFPUG, data=otherTrainData)
	IFPUG.predict = cbind(predicted=predict(IFPUG.m, otherTestData), actual=otherTestData$Effort)
	print(IFPUG.predict)
	IFPUG.mre = apply(IFPUG.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	IFPUG.mmre = mean(IFPUG.mre)
	print("IFPUG.mmre")
	print(IFPUG.mmre)
	#IFPUG.preds = sapply(IFPUG.mre, function(x) calculatePreds(x))
	IFPUG.pred15 = length(IFPUG.mre[IFPUG.mre<=0.15])/length(IFPUG.mre)
	IFPUG.pred25 = length(IFPUG.mre[IFPUG.mre<=0.25])/length(IFPUG.mre)
	IFPUG.pred50 = length(IFPUG.mre[IFPUG.mre<=0.50])/length(IFPUG.mre)
	print(c(IFPUG.pred15, IFPUG.pred25, IFPUG.pred50))
	
	IFPUG.pred <- c()
	for(j in 1:50){
	  IFPUG.pred <- c(IFPUG.pred, length(IFPUG.mre[IFPUG.mre<=0.01*j])/length(IFPUG.mre))
	}
	
	#print("other test data");
	#print(otherTestData);
	print('cocomo apriori testing set predication')
	cocomoAprioriEstimationTestData = otherTestData[!otherTestData$Priori_COCOMO_Estimate == 0,]
	#print(cocomoAprioriEstimationTestData)
	cocomo_apriori.predict = cbind(predicted=cocomoAprioriEstimationTestData$Priori_COCOMO_Estimate, actual=cocomoAprioriEstimationTestData$Effort)
	#print(cocomo_apriori.predict)
	cocomo_apriori.mre = apply(cocomo_apriori.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	cocomo_apriori.mmre = mean(cocomo_apriori.mre)
	print(cocomo_apriori.mmre)
	#cocomo_apriori.preds = sapply(cocomo_apriori.mre, function(x) calculatePreds(x))
	cocomo_apriori.pred15 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.15])/length(cocomo_apriori.mre)
	cocomo_apriori.pred25 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.25])/length(cocomo_apriori.mre)
	cocomo_apriori.pred50 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.50])/length(cocomo_apriori.mre)
	#print(c(cocomo_apriori.pred15, cocomo_apriori.pred25, cocomo_apriori.pred50))
	
	cocomo_apriori.pred <- c()
	for(j in 1:50){
		cocomo_apriori.pred <- c(cocomo_apriori.pred, length(cocomo_apriori.mre[cocomo_apriori.mre<=0.01*j])/length(cocomo_apriori.mre))
	}
	
	print('fp testing set predication')
	COSMIC.m = lm(Effort~COSMIC, data=otherTrainData)
	COSMIC.predict = cbind(predicted=predict(COSMIC.m, otherTestData), actual=otherTestData$Effort)
	print(COSMIC.predict)
	COSMIC.mre = apply(COSMIC.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	COSMIC.mmre = mean(COSMIC.mre)
	print("COSMIC.mmre")
	print(COSMIC.mmre)
	#COSMIC.preds = sapply(COSMIC.mre, function(x) calculatePreds(x))
	COSMIC.pred15 = length(COSMIC.mre[COSMIC.mre<=0.15])/length(COSMIC.mre)
	COSMIC.pred25 = length(COSMIC.mre[COSMIC.mre<=0.25])/length(COSMIC.mre)
	COSMIC.pred50 = length(COSMIC.mre[COSMIC.mre<=0.50])/length(COSMIC.mre)
	print(c(COSMIC.pred15, COSMIC.pred25, COSMIC.pred50))
	
	COSMIC.pred <- c()
	for(j in 1:50){
	  COSMIC.pred <- c(COSMIC.pred, length(COSMIC.mre[COSMIC.mre<=0.01*j])/length(COSMIC.mre))
	}
	
	print('fp testing set predication')
	MKII.m = lm(Effort~MKII, data=otherTrainData)
	MKII.predict = cbind(predicted=predict(MKII.m, otherTestData), actual=otherTestData$Effort)
	print(MKII.predict)
	MKII.mre = apply(MKII.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	MKII.mmre = mean(MKII.mre)
	print("MKII.mmre")
	print(MKII.mmre)
	#MKII.preds = sapply(MKII.mre, function(x) calculatePreds(x))
	MKII.pred15 = length(MKII.mre[MKII.mre<=0.15])/length(MKII.mre)
	MKII.pred25 = length(MKII.mre[MKII.mre<=0.25])/length(MKII.mre)
	MKII.pred50 = length(MKII.mre[MKII.mre<=0.50])/length(MKII.mre)
	print(c(MKII.pred15, MKII.pred25, MKII.pred50))
	
	MKII.pred <- c()
	for(j in 1:50){
	  MKII.pred <- c(MKII.pred, length(MKII.mre[MKII.mre<=0.01*j])/length(MKII.mre))
	}
	
	print('sloc testing set predication')
	SLOC.m = lm(Effort~Sloc, data=otherTrainData)
	SLOC.predict = cbind(predicted=predict(SLOC.m, otherTestData), actual=otherTestData$Effort)
	print(SLOC.predict)
	SLOC.mre = apply(SLOC.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	SLOC.mmre = mean(SLOC.mre)
	print("SLOC.mmre")
	print(SLOC.mmre)
	#SLOC.preds = sapply(SLOC.mre, function(x) calculatePreds(x))
	SLOC.pred15 = length(SLOC.mre[SLOC.mre<=0.15])/length(SLOC.mre)
	SLOC.pred25 = length(SLOC.mre[SLOC.mre<=0.25])/length(SLOC.mre)
	SLOC.pred50 = length(SLOC.mre[SLOC.mre<=0.50])/length(SLOC.mre)
	print(c(SLOC.pred15, SLOC.pred25, SLOC.pred50))
	
	SLOC.pred <- c()
	for(j in 1:50){
	  SLOC.pred <- c(SLOC.pred, length(SLOC.mre[SLOC.mre<=0.01*j])/length(SLOC.mre))
	}
	
	print('ln sloc testing set predication')
	otherTrainData$log_effort = log(otherTrainData$Effort)
	otherTrainData$log_sloc = log(otherTrainData$SLOC)
	SLOC_LN.m = lm(log_effort~log_sloc, data=otherTrainData)
	a = SLOC_LN.m$coefficients
	b = SLOC_LN.m$coefficients
	SLOC_LN.predict = cbind(predicted=otherTestData^b+exp(a), actual=otherTestData$Effort)
	print(SLOC_LN.predict)
	SLOC_LN.mre = apply(SLOC_LN.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	SLOC_LN.mmre = mean(SLOC_LN.mre)
	print("SLOC_LN.mmre")
	print(SLOC_LN.mmre)
	#SLOC_LN.preds = sapply(SLOC_LN.mre, function(x) calculatePreds(x))
	SLOC_LN.pred15 = length(SLOC_LN.mre[SLOC_LN.mre<=0.15])/length(SLOC_LN.mre)
	SLOC_LN.pred25 = length(SLOC_LN.mre[SLOC_LN.mre<=0.25])/length(SLOC_LN.mre)
	SLOC_LN.pred50 = length(SLOC_LN.mre[SLOC_LN.mre<=0.50])/length(SLOC_LN.mre)
	print(c(SLOC_LN.pred15, SLOC_LN.pred25, SLOC_LN.pred50))
	
	
	print('ln sloc testing set predication')
	otherTrainData$log_effort = log(otherTrainData$Effort)
	otherTrainData$log_sloc = log(otherTrainData$KSLOC)
	SLOC_LN.m = lm(log_effort~log_sloc, data=otherTrainData)
	a = summary(SLOC_LN.m)$coefficients[1,1]
	b = summary(SLOC_LN.m)$coefficients[2,1]
	SLOC_LN.predict = cbind(predicted=otherTestData$KSLOC^b+exp(a), actual=otherTestData$Effort)
	SLOC_LN.mre = apply(SLOC_LN.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	SLOC_LN.mre <- SLOC_LN.mre[!is.na(SLOC_LN.mre)]
	SLOC_LN.mmre = mean(SLOC_LN.mre)
	print(SLOC_LN.mmre)
	
	SLOC_LN.pred <- c()
	for(j in 1:50){
	  SLOC_LN.pred <- c(SLOC_LN.pred, length(SLOC_LN.mre[SLOC_LN.mre<=0.01*j])/length(SLOC_LN.mre))
	}
	
	
	foldResults[i,] = c(
			eucp.mmre,eucp.pred15,eucp.pred25,eucp.pred50,
			exucp.mmre,exucp.pred15,exucp.pred25,exucp.pred50,
			ducp.mmre,ducp.pred15,ducp.pred25,ducp.pred50,
			ucp.mmre,ucp.pred15,ucp.pred25,ucp.pred50,
			cocomo.mmre,cocomo.pred15,cocomo.pred25,cocomo.pred50,
			cocomo_apriori.mmre,cocomo_apriori.pred15,cocomo_apriori.pred25,cocomo_apriori.pred50,
			IFPUG.mmre,IFPUG.pred15,IFPUG.pred25,IFPUG.pred50,
			MKII.mmre,MKII.pred15,MKII.pred25,MKII.pred50,
			COSMIC.mmre,COSMIC.pred15,COSMIC.pred25,COSMIC.pred50,
			SLOC.mmre,SLOC.pred15,SLOC.pred25,SLOC.pred50,
			SLOC_LN.mmre,SLOC_LN.pred15,SLOC_LN.pred25,SLOC_LN.pred50
			)
	
	foldResults1[,,i] = array(c(eucp.pred,exucp.pred,ducp.pred,ucp.pred,cocomo.pred,cocomo_apriori.pred,IFPUG.pred,MKII.pred,COSMIC.pred, SLOC.pred, SLOC_LN.pred),c(50,11))
}

#print(foldResults)

#average out the folds.
cvResults <- c(
		mean(foldResults[, 'eucp_mmre']),
		mean(foldResults[, 'eucp_pred15']),
		mean(foldResults[, 'eucp_pred25']),
		mean(foldResults[, 'eucp_pred50']),
		mean(foldResults[, 'exucp_mmre']),
		mean(foldResults[, 'exucp_pred15']),
		mean(foldResults[, 'exucp_pred25']),
		mean(foldResults[, 'exucp_pred50']),
		mean(foldResults[, 'ducp_mmre']),
		mean(foldResults[, 'ducp_pred15']),
		mean(foldResults[, 'ducp_pred25']),
		mean(foldResults[, 'ducp_pred50']),
		mean(foldResults[, 'ucp_mmre']),
		mean(foldResults[, 'ucp_pred15']),
		mean(foldResults[, 'ucp_pred25']),
		mean(foldResults[, 'ucp_pred50']),
		mean(foldResults[, 'cocomo_mmre']),
		mean(foldResults[, 'cocomo_pred15']),
		mean(foldResults[, 'cocomo_pred25']),
		mean(foldResults[, 'cocomo_pred50']),
		mean(foldResults[, 'cocomo_apriori_mmre']),
		mean(foldResults[, 'cocomo_apriori_pred15']),
		mean(foldResults[, 'cocomo_apriori_pred25']),
		mean(foldResults[, 'cocomo_apriori_pred50']),
		mean(foldResults[, 'IFPUG_mmre']),
		mean(foldResults[, 'IFPUG_pred15']),
		mean(foldResults[, 'IFPUG_pred25']),
		mean(foldResults[, 'IFPUG_pred50']),
		mean(foldResults[, 'MKII_mmre']),
		mean(foldResults[, 'MKII_pred15']),
		mean(foldResults[, 'MKII_pred25']),
		mean(foldResults[, 'MKII_pred50']),
		mean(foldResults[, 'COSMIC_mmre']),
		mean(foldResults[, 'COSMIC_pred15']),
		mean(foldResults[, 'COSMIC_pred25']),
		mean(foldResults[, 'COSMIC_pred50']),
		mean(foldResults[, 'SLOC_mmre']),
		mean(foldResults[, 'SLOC_pred15']),
		mean(foldResults[, 'SLOC_pred25']),
		mean(foldResults[, 'SLOC_pred50']),
		mean(foldResults[, 'SLOC_LN_mmre']),
		mean(foldResults[, 'SLOC_LN_pred15']),
		mean(foldResults[, 'SLOC_LN_pred25']),
		mean(foldResults[, 'SLOC_LN_pred50'])
		);



names(cvResults) <- c(
		'eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50',
		'exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50',
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50',
		'IFPUG_mmre','IFPUG_pred15','IFPUG_pred25','IFPUG_pred50',
		'MKII_mmre','MKII_pred15','MKII_pred25','MKII_pred50',
		'COSMIC_mmre','COSMIC_pred15','COSMIC_pred25','COSMIC_pred50',
		'SLOC_mmre','SLOC_pred15','SLOC_pred25','SLOC_pred50',
		'SLOC_LN_mmre','SLOC_LN_pred15','SLOC_LN_pred25','SLOC_LN_pred50'
		)

avgPreds <- matrix(nrow=50,ncol=12)
colnames(avgPreds) <- c("Pred","EUCP","EXUCP","DUCP", "UCP", "COCOMO", "COCOMO Apriori", "IFPUG", "MKII", "COSMIC", "SLOC", "SLOC_LN")
for(i in 1:50){
	eucp_fold_mean = mean(foldResults1[i,1,]);
	exucp_fold_mean = mean(foldResults1[i,2,]);
	ducp_fold_mean = mean(foldResults1[i,3,]);
	ucp_fold_mean = mean(foldResults1[i,4,]);
	cocomo_fold_mean = mean(foldResults1[i,5,]);
	cocomo_apriori_fold_mean = mean(foldResults1[i,6,]);
	IFPUG_fold_mean = mean(foldResults1[i,7,]);
	MKII_fold_mean = mean(foldResults1[i,8,]);
	COSMIC_fold_mean = mean(foldResults1[i,9,]);
	SLOC_fold_mean = mean(foldResults1[i,10,]);
	SLOC_LN_fold_mean = mean(foldResults1[i,11,]);
	avgPreds[i,] <- c(i,eucp_fold_mean,exucp_fold_mean,ducp_fold_mean,ucp_fold_mean,cocomo_fold_mean,cocomo_apriori_fold_mean,IFPUG_fold_mean,MKII_fold_mean,COSMIC_fold_mean,SLOC_fold_mean,SLOC_LN_fold_mean)
	#print(i)
	#print(avgPreds[i,])
}


ret <-list(cvResults = cvResults, avgPreds = avgPreds)
}
