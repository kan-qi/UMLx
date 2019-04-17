#source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.

mre <- function(x) abs(x[1] - x[2])/x[2]
mmre <- function(mre) mean(mre)
pred15 <- function(mre) length(mre[mre<=0.15])/length(mre)
pred25 <- function(mre) length(mre[mre<=0.15])/length(mre)
pred50 <- function(mre) length(mre[mre<=0.50])/length(mre)
mdmre <- function(mre) median(mre)
mae<- function(x) sum(apply(x, 1, mre))/length(x)
predR <- function(mre, predRange) {
  eval_pred <- c()
  
  for(k in 1:predRange){
    eval_pred <- c(eval_pred, length(mre[mre<=0.01*k])/length(mre))
  }
  
  eval_pred
}

modelBenchmark <- function(models, dataset){

#dataset = modelData

nfold = 2

folds <- cut(seq(1,nrow(dataset)),breaks=nfold,labels=FALSE)

modelNames = names(models)

nmodels <- length(modelNames)

accuracy_metrics <- c('mmre','pred15','pred25','pred50', "mdmre", "mae")

nmetrics <- length(accuracy_metrics)

predRange <- 50

#data structure to hold the data for 10 fold cross validation

model_accuracy_indice <- c()
for(i in 1:length(modelNames)){
  modelName = modelNames[i]
  model_accuracy_indice <- cbind(model_accuracy_indice, paste(modelName, accuracy_metrics, sep="_"));
}

foldResults <- matrix(nrow=nfold,ncol=nmodels*nmetrics)
colnames(foldResults) <- model_accuracy_indice

foldResults1 <- array(0,dim=c(predRange,nmodels,nfold))

#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function
	testIndexes <- which(folds==i,arr.ind=TRUE)
	
	testData <- dataset[testIndexes, ]
	trainData <- dataset[-testIndexes, ]
	
	eval_metrics = c()
	eval_pred = c()
	for(j in 1:nmodels){
	  modelName <- modelNames[j]
	  
	  model = fit(trainData, modelNames[j], models[[j]])
	  
	  predicted = m_predict(model, testData)
	  #print(predicted)
	  
	  actual = testData$Effort
	  names(actual) <- rownames(testData)
	  #print(actual)
	  
	  intersectNames <- intersect(names(predicted), names(actual))
	  
	  model_eval_predict = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames] )
	  
	  eval_metric_results = list()
	  
	  model_eval_mre = apply(model_eval_predict, 1, mre)
	  
	  
	  #print(modelName)
	  
	  model_eval_mre <- na.omit(model_eval_mre)
	  #print(model_eval_mre)
	  
	  model_eval_mmre = mmre(model_eval_mre)
	  model_eval_pred15 = pred15(model_eval_mre)
	  model_eval_pred25 = pred25(model_eval_mre)
	  model_eval_pred50 = pred50(model_eval_mre)
	  model_eval_mdmre = mdmre(model_eval_mre)
	  model_eval_mae = sum(model_eval_mre)/length(model_eval_predict)
	  eval_metrics <- c(
	    eval_metrics, model_eval_mmre,model_eval_pred15,model_eval_pred25,model_eval_pred50, model_eval_mdmre, model_eval_mae
	  )
	  
	  #print(eval_metrics)
	  
	  eval_pred = c(eval_pred, predR(model_eval_mre, predRange))
	}
	
	foldResults[i,] = eval_metrics
	foldResults1[,,i] = eval_pred
}

#print(foldResults)

cvResults <- apply(foldResults, 2, mean);

names(cvResults) <- model_accuracy_indice

#print(cvResults)

avgPreds <- matrix(nrow=predRange,ncol=nmodels+1)
colnames(avgPreds) <- c("Pred",modelNames)
for(i in 1:predRange)
{
  
	avgPreds[i,] <- c(i, rep(0, length(modelNames)))
	
	for(j in 1:length(modelNames)){
	  model_fold_mean = mean(foldResults1[i,j,]);
	  avgPreds[i,j+1] <- model_fold_mean
	}
	
}

bootstrappingSE(dataset, models)

ret <-list(cvResults = cvResults, avgPreds = avgPreds)

}

bootstrappingSE <- function(dataset, models){
#bootstrapping the sample and run the run the output sample testing.

}