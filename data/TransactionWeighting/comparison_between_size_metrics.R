source("transaction_weights_calibration4.R")


compareBetweenSizeMetrics <- function(TNModelData, SWTIIModelData, SWTIIIModelData, otherSizeMetricsData){
  
  #useCaseData <- data[c("Effort", "EUCP", "EXUCP", "DUCP")]
  

  # estimate the predication accuracy by n fold cross validation.
  #Randomly shuffle the data
  #useCaseData<-useCaseData[sample(nrow(useCaseData)),]
  #Create 10 equally size folds
  nfold = 5
  folds <- cut(seq(1,nrow(TNModelData)),breaks=nfold,labels=FALSE)
  
#add cocomo and original use case points into the comparison

#otherSizeMetricsData=data[c("Effort", "COCOMO_Estimate", "Priori_COCOMO_Estimate", "UCP")];
#DataFrame=data.frame(Effort,UCP)
#Effort
#UCP
#OriginalUseCaseModel=lm(Effort~UCP,data=otherSizeMetricsData)

#summary(OriginalUseCaseModel)

#w=coef(OriginalUseCaseModel)["UCP"]

#otherSizeMetricsData$UCPEffort=w*otherSizeMetricsData$UCP

#otherSizeMetricsData<-otherSizeMetricsData[sample(nrow(otherSizeMetricsData)),]

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(nrow=nfold,ncol=24)
colnames(foldResults) <- c(
		'eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50', 
		'exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50',
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50'
		)

foldResults1 <- array(0,dim=c(50,6,nfold))

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
	
	eucp.pred <- 0
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
	
	exucp.pred <- 0
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
	
	ducp.pred <- 0
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
	
	ucp.pred <- 0
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
	
	cocomo.pred <- 0
	for(j in 1:50){
		cocomo.pred <- c(cocomo.pred, length(cocomo.mre[cocomo.mre<=0.01*j])/length(cocomo.mre))
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
	#print(cocomo_apriori.mmre)
	#cocomo_apriori.preds = sapply(cocomo_apriori.mre, function(x) calculatePreds(x))
	cocomo_apriori.pred15 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.15])/length(cocomo_apriori.mre)
	cocomo_apriori.pred25 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.25])/length(cocomo_apriori.mre)
	cocomo_apriori.pred50 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.50])/length(cocomo_apriori.mre)
	#print(c(cocomo_apriori.pred15, cocomo_apriori.pred25, cocomo_apriori.pred50))
	
	cocomo_apriori.pred <- 0
	for(j in 1:50){
		cocomo_apriori.pred <- c(cocomo_apriori.pred, length(cocomo_apriori.mre[cocomo_apriori.mre<=0.01*j])/length(cocomo_apriori.mre))
	}
	
	foldResults[i,] = c(
			eucp.mmre,eucp.pred15,eucp.pred25,eucp.pred50,
			exucp.mmre,exucp.pred15,exucp.pred25,exucp.pred50,
			ducp.mmre,ducp.pred15,ducp.pred25,ducp.pred50,
			ucp.mmre,ucp.pred15,ucp.pred25,ucp.pred50,
			cocomo.mmre,cocomo.pred15,cocomo.pred25,cocomo.pred50,
			cocomo_apriori.mmre,cocomo_apriori.pred15,cocomo_apriori.pred25,cocomo_apriori.pred50
			)
	
	foldResults1[,,i] = array(c(eucp.pred,exucp.pred,ducp.pred,ucp.pred,cocomo.pred,cocomo_apriori.pred),c(50,6))
}

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
		mean(foldResults[, 'cocomo_apriori_pred50'])
		);

names(cvResults) <- c(
		'eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50',
		'exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50',
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50'
		)

avgPreds <- matrix(nrow=50,ncol=7)
colnames(avgPreds) <- c("Pred","EUCP","EXUCP","DUCP", "UCP", "COCOMO", "COCOMO Apriori")
for(i in 1:50){
	eucp_fold_mean = mean(foldResults1[i,1,]);
	exucp_fold_mean = mean(foldResults1[i,2,]);
	ducp_fold_mean = mean(foldResults1[i,3,]);
	ucp_fold_mean = mean(foldResults1[i,4,]);
	cocomo_fold_mean = mean(foldResults1[i,5,]);
	cocomo_apriori_fold_mean = mean(foldResults1[i,6,]);
	avgPreds[i,] <- c(i,eucp_fold_mean,exucp_fold_mean,ducp_fold_mean,ucp_fold_mean,cocomo_fold_mean,cocomo_apriori_fold_mean)
	#print(i)
	#print(avgPreds[i,])
}


ret <-list(cvResults = cvResults, avgPreds = avgPreds)
}
