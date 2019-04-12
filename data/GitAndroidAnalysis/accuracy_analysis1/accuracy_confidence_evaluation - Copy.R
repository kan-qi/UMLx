source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.


modelBenchMark <- function(models, dataset){
  
modelNames <- names(models)
  
#Create 10 equally size folds
  
nfold = 5
folds <- cut(seq(1,nrow(SWTIIIModelData)),breaks=nfold,labels=FALSE)

nmodels <- length(models)

accuracy_metrics <- c('mmre','pred15','pred25','pred50', "mdmre", "mae",)

nmetrics <- length(accuracy_metrics)

predRange <- 50

#data structure to hold the data for 10 fold cross validation
#adding a few more accuracy metrics: MdMRE, MAE
model_accuracy_indice <- c()
for(i in 1:length(modelNames)){
  modelName = modelNames[i]
  model_accuracy_indice <- cbind(model_accuracy_indice, paste(moelName, accuracy_metrics, sep="_"));
}

foldResults <- matrix(nrow=nfold,ncol=nmodels*nmetrics)
colnames(foldResults) <- model_accuracy_indice

foldResults1 <- array(0,dim=c(predRange,nmodels,nfold))

#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function
	testIndexes <- which(folds==i,arr.ind=TRUE)
	
	testSWTIIIModelData <- SWTIIIModelData[testIndexes, ]
	trainSWTIIIModelData <- SWTIIIModelData[-testIndexes, ]
	
	otherTestData <- otherSizeMetricsData[testIndexes, ]
	otherTrainData <- otherSizeMetricsData[-testIndexes,]
	
	
	for(j in models){
	  model <- models[[i]]
	  
	  print('ducp testing set predication')
	  levels3 <- length(trainSWTIIIModelData)-1
	  normFactor3 <- calNormFactor(trainSWTIIIModelData, levels3)
	  
	  model.eval.predict = cbind(predicted=models.predict(testSWTIIIModelData), actual=testSWTIIIModelData$Effort)
	  
	  #print(model.eval.predict)
	  
	  model.eval.mre = apply(model.eval.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	  
	  model.eval.mmre = mean(model.eval.mre)
	  model.eval.pred15 = length(model.eval.mre[model.eval.mre<=0.15])/length(model.eval.mre)
	  model.eval.pred25 = length(model.eval.mre[model.eval.mre<=0.25])/length(model.eval.mre)
	  model.eval.pred50 = length(model.eval.mre[model.eval.mre<=0.50])/length(model.eval.mre)
	  
	  model.eval.mdmre = median(model.eval.mre)
	  model.eval.mae = sum(apply(model.eval.predict, 1, function(x) abs(x[1] - x[2])))/length(model.eval.predict)
	  
	  model.eval.pred <- c()
	  for(j in 1:predRange){
	    model.eval.pred <- c(model.eval.pred, length(model.eval.mre[model.eval.mre<=0.01*j])/length(model.eval.mre))
	  }
	  
	  foldResults[i,] <- cbin(foldResults[i,], c(
	    model.evalmmre,model.evalpred15,model.evalpred25,model.evalpred50, model.evalmdmre, model.evalmae
	  ))
	  
	  
	  foldResults1[,,i] = cbind(foldResults1[,,i], model.evalpred);
	}
}

#print(foldResults)

#average out the folds.
cvResults <- lappy(foldResults, mean);



names(cvResults) <- model_accuracy_indice

avgPreds <- matrix(nrow=predRange,ncol=nmodels+1)
colnames(avgPreds) <- c("Pred",modelNames)
for(i in 1:predRange)
{
  
	avgPreds[i,] <- c(i)
	
	for(j in modelNames){
	  
	  model_fold_mean = mean(foldResults1[i,j,]);
	}
	
	avgPreds[i,] <- cbind(avgPreds, model_fold_mean)
}

bootstrappingSE(SWTIIIModelData, otherSizeMetricsData, model)

ret <-list(cvResults = cvResults, avgPreds = avgPreds)
}


bootstrappingSE <- function(SWTIIIModelData, otherSizeMetricsData, model){
#bootstrapping the sample and run the run the output sample testing.

}