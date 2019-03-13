source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.

#compareBetweenSizeMetrics <- function(SWTIIIModelData, otherSizeMetricsData){
compareBetweenSizeMetrics <- function(SWTIIIModelData, otherSizeMetricsData, model){
  
#Create 10 equally size folds
  
nfold = 5
folds <- cut(seq(1,nrow(SWTIIIModelData)),breaks=nfold,labels=FALSE)

nmodels <- 9
nmetrics <- 6

predRange <- 50

#data structure to hold the data for 10 fold cross validation
#adding a few more accuracy metrics: MdMRE, MAE
foldResults <- matrix(nrow=nfold,ncol=nmodels*nmetrics)
colnames(foldResults) <- c(
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50', "ducp_mdmre", "ducp_mae",
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50', "ucp_mdmre", "ucp_mae",
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50', "cocomo_mdmre", "cocomo_mae",
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50', "cocomo_apriori_mdmre", "cocomo_apriori_mae",
		'IFPUG_mmre','IFPUG_pred15','IFPUG_pred25','IFPUG_pred50', "IFPUG_mdmre", "IFPUG_mae",
		'MKII_mmre','MKII_pred15','MKII_pred25','MKII_pred50', "MKII_mdmre", "MKII_mae",
		'COSMIC_mmre','COSMIC_pred15','COSMIC_pred25','COSMIC_pred50', "COSMIC_mdmre", "COSMIC_mae",
		'SLOC_mmre','SLOC_pred15','SLOC_pred25','SLOC_pred50', "SLOC_mdmre", "SLOC_mae",
		'SLOC_LN_mmre','SLOC_LN_pred15','SLOC_LN_pred25','SLOC_LN_pred50', "SLOC_LN_mdmre", "SLOC_LN_mae"
)

foldResults1 <- array(0,dim=c(predRange,nmodels,nfold))

#i = 1

#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function
  #i = 1
	testIndexes <- which(folds==i,arr.ind=TRUE)
	
	testSWTIIIModelData <- SWTIIIModelData[testIndexes, ]
	trainSWTIIIModelData <- SWTIIIModelData[-testIndexes, ]
	
	otherTestData <- otherSizeMetricsData[testIndexes, ]
	otherTrainData <- otherSizeMetricsData[-testIndexes,]
	
	print('ducp testing set predication')
	levels3 <- length(trainSWTIIIModelData)-1
	normFactor3 <- calNormFactor(trainSWTIIIModelData, levels3)
	
	means3 <- genMeans(levels3)
	#print(means)
	covar3 <- genVariance(means3, 1)
	#bayesianModel3 <- bayesfit3(trainSWTIIIModelData, 100000, means3, covar3, normFactor3['mean'], normFactor3['var'])
	
	bayesianModel3 <- model
	
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

	ducp.mdmre = median(ducp.mre)
	ducp.mae = sum(apply(ducp.predict, 1, function(x) abs(x[1] - x[2])))/length(ducp.predict)
	
	ducp.pred <- c()
	for(j in 1:predRange){
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

	ucp.mdmre = median(ucp.mre)
	ucp.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(ucp.predict)
	
	ucp.pred <- c()
	for(j in 1:predRange){
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
	
	cocomo.mdmre = median(cocomo.mre)
	cocomo.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(cocomo.predict)

	cocomo.pred <- c()
	for(j in 1:predRange){
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

	IFPUG.mdmre = median(cocomo.mre)
	IFPUG.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(IFPUG.predict)
	
	IFPUG.pred <- c()
	for(j in 1:predRange){
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

	cocomo_apriori.mdmre = median(cocomo.mre)
	cocomo_apriori.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(cocomo_apriori.predict)
	
	cocomo_apriori.pred <- c()
	for(j in 1:predRange){
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

	COSMIC.mdmre = median(cocomo.mre)
	COSMIC.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(COSMIC.predict)
	
	COSMIC.pred <- c()
	for(j in 1:predRange){
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
	MKII.pred15 = length(MKII.mre[MKII.mre<=0.15])/length(MKII.mre)
	MKII.pred25 = length(MKII.mre[MKII.mre<=0.25])/length(MKII.mre)
	MKII.pred50 = length(MKII.mre[MKII.mre<=0.50])/length(MKII.mre)
	print(c(MKII.pred15, MKII.pred25, MKII.pred50))

	MKII.mdmre = median(cocomo.mre)
	MKII.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(MKII.predict)
	
	MKII.pred <- c()
	for(j in 1:predRange){
	  MKII.pred <- c(MKII.pred, length(MKII.mre[MKII.mre<=0.01*j])/length(MKII.mre))
	}
	
	print('sloc testing set predication')
	SLOC.m = lm(Effort~KSLOC, data=otherTrainData)
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

	SLOC.mdmre = median(cocomo.mre)
	SLOC.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(SLOC.predict)
	
	SLOC.pred <- c()
	for(j in 1:predRange){
	  SLOC.pred <- c(SLOC.pred, length(SLOC.mre[SLOC.mre<=0.01*j])/length(SLOC.mre))
	}
	
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
	SLOC_LN.pred15 = length(SLOC_LN.mre[SLOC_LN.mre<=0.15])/length(SLOC_LN.mre)
	SLOC_LN.pred25 = length(SLOC_LN.mre[SLOC_LN.mre<=0.25])/length(SLOC_LN.mre)
	SLOC_LN.pred50 = length(SLOC_LN.mre[SLOC_LN.mre<=0.50])/length(SLOC_LN.mre)
	print(c(SLOC_LN.pred15, SLOC_LN.pred25, SLOC_LN.pred50))

	SLOC_LN.mdmre = median(cocomo.mre)
	SLOC_LN.mae = sum(apply(ucp.predict, 1, function(x) abs(x[1] - x[2])))/length(SLOC_LN.predict)
	
	SLOC_LN.pred <- c()
	for(j in 1:predRange){
	  SLOC_LN.pred <- c(SLOC_LN.pred, length(SLOC_LN.mre[SLOC_LN.mre<=0.01*j])/length(SLOC_LN.mre))
	}
	
	foldResults[i,] <- c(
			ducp.mmre,ducp.pred15,ducp.pred25,ducp.pred50, ducp.mdmre, ducp.mae,
			ucp.mmre,ucp.pred15,ucp.pred25,ucp.pred50, ucp.mdmre, ucp.mae,
			cocomo.mmre,cocomo.pred15,cocomo.pred25,cocomo.pred50, cocomo.mdmre, cocomo.mae,
			cocomo_apriori.mmre,cocomo_apriori.pred15,cocomo_apriori.pred25,cocomo_apriori.pred50, cocomo_apriori.mdmre, cocomo_apriori.mae,
			IFPUG.mmre,IFPUG.pred15,IFPUG.pred25,IFPUG.pred50, IFPUG.mdmre, IFPUG.mae,
			MKII.mmre, MKII.pred15,MKII.pred25,MKII.pred50, MKII.mdmre, MKII.mae,
			COSMIC.mmre,COSMIC.pred15,COSMIC.pred25,COSMIC.pred50, COSMIC.mdmre, COSMIC.mae,
			SLOC.mmre, SLOC.pred15, SLOC.pred25, SLOC.pred50, SLOC.mdmre, SLOC.mae,
			SLOC_LN.mmre,SLOC_LN.pred15,SLOC_LN.pred25,SLOC_LN.pred50, SLOC_LN.mdmre, SLOC_LN.mae
	)
	
	foldResults1[,,i] = array(c(ducp.pred,ucp.pred,cocomo.pred,cocomo_apriori.pred,IFPUG.pred,MKII.pred,COSMIC.pred, SLOC.pred, SLOC_LN.pred),c(predRange,nmodels))
}

#print(foldResults)

#average out the folds.
cvResults <- c(
		mean(foldResults[, 'ducp_mmre']),
		mean(foldResults[, 'ducp_pred15']),
		mean(foldResults[, 'ducp_pred25']),
		mean(foldResults[, 'ducp_pred50']),
		mean(foldResults[, 'ducp_mdmre']),
		mean(foldResults[, 'ducp_mae']),
		mean(foldResults[, 'ucp_mmre']),
		mean(foldResults[, 'ucp_pred15']),
		mean(foldResults[, 'ucp_pred25']),
		mean(foldResults[, 'ucp_pred50']),
		mean(foldResults[, 'ucp_mdmre']),
		mean(foldResults[, 'ucp_mae']),
		mean(foldResults[, 'cocomo_mmre']),
		mean(foldResults[, 'cocomo_pred15']),
		mean(foldResults[, 'cocomo_pred25']),
		mean(foldResults[, 'cocomo_pred50']),
		mean(foldResults[, 'cocomo_mdmre']),
		mean(foldResults[, 'cocomo_mae']),
		mean(foldResults[, 'cocomo_apriori_mmre']),
		mean(foldResults[, 'cocomo_apriori_pred15']),
		mean(foldResults[, 'cocomo_apriori_pred25']),
		mean(foldResults[, 'cocomo_apriori_pred50']),
		mean(foldResults[, 'cocomo_apriori_mdmre']),
		mean(foldResults[, 'cocomo_apriori_mae']),
		mean(foldResults[, 'IFPUG_mmre']),
		mean(foldResults[, 'IFPUG_pred15']),
		mean(foldResults[, 'IFPUG_pred25']),
		mean(foldResults[, 'IFPUG_pred50']),
		mean(foldResults[, 'IFPUG_mdmre']),
		mean(foldResults[, 'IFPUG_mae']),
		mean(foldResults[, 'MKII_mmre']),
		mean(foldResults[, 'MKII_pred15']),
		mean(foldResults[, 'MKII_pred25']),
		mean(foldResults[, 'MKII_pred50']),
		mean(foldResults[, 'MKII_mdmre']),
		mean(foldResults[, 'MKII_mae']),
		mean(foldResults[, 'COSMIC_mmre']),
		mean(foldResults[, 'COSMIC_pred15']),
		mean(foldResults[, 'COSMIC_pred25']),
		mean(foldResults[, 'COSMIC_pred50']),
		mean(foldResults[, 'COSMIC_mdmre']),
		mean(foldResults[, 'COSMIC_mae']),
		mean(foldResults[, 'SLOC_mmre']),
		mean(foldResults[, 'SLOC_pred15']),
		mean(foldResults[, 'SLOC_pred25']),
		mean(foldResults[, 'SLOC_pred50']),
		mean(foldResults[, 'SLOC_mdmre']),
		mean(foldResults[, 'SLOC_mae']),
		mean(foldResults[, 'SLOC_LN_mmre']),
		mean(foldResults[, 'SLOC_LN_pred15']),
		mean(foldResults[, 'SLOC_LN_pred25']),
		mean(foldResults[, 'SLOC_LN_pred50']),
		mean(foldResults[, 'SLOC_LN_mdmre']),
		mean(foldResults[, 'SLOC_LN_mae'])
		);



names(cvResults) <- c(
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50', 'ducp_mdmre', 'ducp_mae',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50', 'ucp_mdmre', 'ucp_mae',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50', 'cocomo_mdmre', 'cocomo_mae',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50', 'cocomo_apriori_mdmre', 'cocomo_apriori_mae',
		'IFPUG_mmre','IFPUG_pred15','IFPUG_pred25','IFPUG_pred50', 'IFPUG_mdmre', 'IFPUG_mae',
		'MKII_mmre','MKII_pred15','MKII_pred25','MKII_pred50', 'MKII_mdmre', 'MKII_mae',
		'COSMIC_mmre','COSMIC_pred15','COSMIC_pred25','COSMIC_pred50', 'COSMIC_mdmre', 'COSMIC_mae',
		'SLOC_mmre','SLOC_pred15','SLOC_pred25','SLOC_pred50', 'SLOC_mdmre', 'SLOC_mae',
		'SLOC_LN_mmre','SLOC_LN_pred15','SLOC_LN_pred25','SLOC_LN_pred50', 'SLOC_LN_mdmre', 'SLOC_LN_mae'
		)

avgPreds <- matrix(nrow=predRange,ncol=nmodels+1)
colnames(avgPreds) <- c("Pred","DUCP", "UCP", "COCOMO", "COCOMO Apriori", "IFPUG", "MKII", "COSMIC", "SLOC", "SLOC_LN")
for(i in 1:predRange)
{
	ducp_fold_mean = mean(foldResults1[i,1,]);
	ucp_fold_mean = mean(foldResults1[i,2,]);
	cocomo_fold_mean = mean(foldResults1[i,3,]);
	cocomo_apriori_fold_mean = mean(foldResults1[i,4,]);
	IFPUG_fold_mean = mean(foldResults1[i,5,]);
	MKII_fold_mean = mean(foldResults1[i,6,]);
	COSMIC_fold_mean = mean(foldResults1[i,7,]);
	SLOC_fold_mean = mean(foldResults1[i,8,]);
	SLOC_LN_fold_mean = mean(foldResults1[i,9,]);
	avgPreds[i,] <- c(i,ducp_fold_mean,ucp_fold_mean,cocomo_fold_mean,cocomo_apriori_fold_mean,IFPUG_fold_mean,MKII_fold_mean,COSMIC_fold_mean,SLOC_fold_mean,SLOC_LN_fold_mean)
}

bootstrappingSE(SWTIIIModelData, otherSizeMetricsData, model)

ret <-list(cvResults = cvResults, avgPreds = avgPreds)
}


bootstrappingSE <- function(SWTIIIModelData, otherSizeMetricsData, model){
#bootstrapping the sample and run the run the output sample testing.

}