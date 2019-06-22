#source("transaction_weights_calibration4.R")

#adding two additional models: sloc and ln_sloc models.

mre <- function(x) abs(x[1] - x[2])/x[2]
mmre <- function(mre) mean(mre)
pred15 <- function(mre) length(mre[mre<=0.15])/length(mre)
pred25 <- function(mre) length(mre[mre<=0.15])/length(mre)
pred50 <- function(mre) length(mre[mre<=0.50])/length(mre)
mdmre <- function(mre) median(mre)
mae<- function(x) sum(apply(x, 1, function(x) abs(x[1] - x[2])))/length(x)
predR <- function(mre, predRange) {
  eval_pred <- c()
  
  for(k in 1:predRange){
    eval_pred <- c(eval_pred, length(mre[mre<=0.01*k])/length(mre))
  }
  
  eval_pred
}

profileData <- function(models, dataset){
  #models = trainedModels
  #dataset = modelData
  
  swti = models$tm1$m
  swtii = models$tm2$m
  swtiii = models$tm3$m
  transactionData <- loadTransactionData(dataset)
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles <- transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  regressionData1 <- generateRegressionData(projects, swti$cuts, effortData, transactionFiles)
  regressionData2 <- generateRegressionData(projects, swtii$cuts, effortData, transactionFiles)
  regressionData3 <- generateRegressionData(projects, swtiii$cuts, effortData, transactionFiles)
  
  regLevels1 <- colnames(regressionData1)[!(colnames(regressionData1) %in% c("Effort"))]
  regLevels2 <- colnames(regressionData2)[!(colnames(regressionData2) %in% c("Effort"))]
  regLevels3 <- colnames(regressionData3)[!(colnames(regressionData3) %in% c("Effort"))]
  
  profileData <- matrix(nrow=nrow(dataset), ncol=17+length(regLevels1)+length(regLevels2)+length(regLevels3))
  profileData <- as.data.frame(profileData)
  rownames(profileData) <- rownames(dataset)
  
  swti_levels <- paste("swti_", regLevels1)
  swtii_levels <- paste("swtii_", regLevels2)
  swtiii_levels <- paste("swtiii_", regLevels3)
  
  colnames(profileData) <- c("Trans", "Stm", "Comp", 
                             "TL", "TL_SE", "TD",
                             "TD_SE", "DETs", "DETs_SE",
                             swti_levels, swtii_levels, swtiii_levels,
                             "SWTI", "SWTII", "SWTIII", "UUCP", "AFP", "SLOC", "COSMIC", "Effort")
  profileData$Trans <- dataset$Tran_Num
  profileData$Stm <- dataset$Stimulus_Num
  profileData$Comp <- dataset$Component_Num
  attr_means <- as.data.frame(t(sapply(transactionFiles, function(x){sapply(x, mean)})))
  attr_sds <- as.data.frame(t(sapply(transactionFiles, function(x){sapply(x, sd)})))
  profileData$TL <- attr_means$TL
  profileData$TD <- attr_means$TD
  profileData$DETs <- attr_means$DETs
  profileData$TL_SE <- attr_sds$TL
  profileData$TD_SE <- attr_sds$TD
  profileData$DETs_SE <- attr_sds$DETs
  
  regress1 <- as.matrix(regressionData1[,regLevels1])
  rownames(regress1) <- rownames(regressionData1)
  colnames(regress1) <- swti_levels
  #print(regress1)
  profileData[,swti_levels] <- regress1
  
  
  regress2 <- as.matrix(regressionData2[,regLevels2])
  rownames(regress2) <- rownames(regressionData2)
  colnames(regress2) <- swtii_levels
  #print(regress1)
  profileData[,swtii_levels] <- regress2
  
  regress3 <- as.matrix(regressionData3[,regLevels3])
  rownames(regress3) <- rownames(regressionData1)
  colnames(regress3) <- swtiii_levels
  #print(regress1)
  profileData[,swtiii_levels] <- regress3
  
  profileData$SWTI <- calculateSize(as.matrix(models$tm1$m$paramVals), regressionData1)
  profileData$SWTII <- calculateSize(as.matrix(models$tm2$m$paramVals), regressionData2) 
  profileData$SWTIII <- calculateSize(as.matrix(models$tm3$m$paramVals), regressionData3) 
  profileData$UUCP <- dataset$UUCP 
  profileData$AFP <- dataset$IFPUG
  profileData$Effort <- effortData
  profileData$SLOC <- dataset$SLOC
  profileData$COSMIC <- dataset$COSMIC
  #write.csv(format(profileData, digits=2, nsmall=2), file = "profileData.csv")
  profileData
}

#the batch method to train the models.
modelTrain <- function(models, dataset){
  trainedModels = list()
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  for(i in 1:nmodels){
    modelName <- modelNames[i]
    
    print(modelName)
    
    model = fit(dataset, modelNames[i], models[[i]])
    
    trainedModels[[modelName]] = model
  }
  
  trainedModels
}

#the batach method to predict with all the trained models
modelPredict <- function(models, dataset){
  predictions = list()
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  for(i in 1:nmodels){
    modelName <- modelNames[i]
    
    print(modelName)

    
    predictions[[modelName]] = m_predict(models[[modelName]], dataset)
  }
  
  predictions
}

#modelBenchmark would preform both cross validation and bootrapping significance test
modelBenchmark <- function(models, dataset){
  #evaluating the goodness of fit for the compared models: R^2 and Eta. Squared (for the standardized effect size)
  goodness_fit_metrics <- c("R2", "eta-squared")
  fitResults <- evalFit(models, dataset, goodness_fit_metrics)
  
  accuracy_metrics <- c('mmre','pred15','pred25','pred50', "mdmre", "mae")
  cvResults <- cv(models, dataset, accuracy_metrics)
  bsResults <- bootstrappingSE(models, dataset, accuracy_metrics)
  ret <-list(
             fitResults = fitResults,
             cvResults = cvResults, 
             bsResults = bsResults,
             model_names = names(models),
             accuracy_metrics = accuracy_metrics
             )
}

evalFit <- function(models, dataset, fit_metrics){
  dataset = modelData
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  nmetrics <- length(fit_metrics)
  
  eval_metric_results = list()
  
  for(j in 1:nmodels){
    modelName <- modelNames[j]
    
    print(modelName)
    
    model = fit(dataset, modelNames[j], models[[j]])
    
    predicted = m_predict(model, dataset)
    
    #print(predicted)
    actual = dataset$Effort
    names(actual) <- rownames(dataset)
    #print(actual)
    
    intersectNames <- intersect(names(predicted), names(actual))
    
    model_eval_fit = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
    #print(model_eval_predict)
    
    #calculate R2 and Eta-squared based on the predicted and actual values.
    #add the evaluationr esults to the "eval_metric_results"
    
    #calculate R2 and Eta-squared based on the predicted and actual values.
    npoints <- nrow(model_eval_fit)
    grouping <- c(1:npoints, 1:npoints)
    anova <- aov( c(model_eval_fit$predicted, model_eval_fit$actual) ~ grouping )
    eta_squared <- etaSquared(anova)[1,1]
    #print(eta_squared)
    
    meanActual <- mean(model_eval_fit$actual)
    r_squared <- 1-sum((model_eval_fit$actual - model_eval_fit$predicted)^2)/sum((model_eval_fit$actual - meanActual)^2)
    #print(r_squared)
    
    #f-test
    f_test = var.test(model_eval_fit$actual - model_eval_fit$predicted, model_eval_fit$actual - meanActual)
    
    #LM <- lm( c(model_eval_fit$predicted, model_eval_fit$actual) ~ grouping );
    #r_squared <- summary(LM)$r.squared
    #print(r_squared)
    
    #add the evaluation results to the "eval_metric_results"
    eval_metric_results[[modelName]] = list(eta_squared = eta_squared, 
                                            r_squared = r_squared,
                                            model_eval_fit = model_eval_fit,
                                            f_test = f_test)
  }
  
  eval_metric_results
}
  
cv <- function(models, dataset, accuracy_metrics){

#dataset = modelData

nfold = 2

folds <- cut(seq(1,nrow(dataset)),breaks=nfold,labels=FALSE)

modelNames = names(models)

nmodels <- length(modelNames)

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
  print("iter:")
  print(i)
	#Segement your data by fold using the which() function
	testIndexes <- which(folds==i,arr.ind=TRUE)
	
	testData <- dataset[testIndexes, ]
	trainData <- dataset[-testIndexes, ]
	
	eval_metrics = c()
	eval_pred = c()
	print(i)
	for(j in 1:nmodels){
	  modelName <- modelNames[j]
	  
	  print(modelName)
	  
	  model = fit(trainData, modelNames[j], models[[j]])
	  
	  predicted = as.vector(m_predict(model, testData))
	  names(predicted) <- rownames(testData)
	  print(predicted)
	  
	  actual = testData$Effort
	  names(actual) <- rownames(testData)
	  
	  print(actual)
	  
	  intersectNames <- intersect(names(predicted), names(actual))
	  
	  model_eval_predict = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
	  #print(model_eval_predict)
	  
	  eval_metric_results = list()
	  
	  model_eval_mre = apply(model_eval_predict, 1, mre)
	  print("mre")
	  print(model_eval_mre)
	  
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

accuracyResults <- apply(foldResults, 2, mean);

names(accuracyResults) <- model_accuracy_indice

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

ret <-list(accuracyResults = accuracyResults, avgPreds = avgPreds, foldResults = foldResults)

}

bootstrappingSE <- function(models, dataset, accuracy_metrics){
#bootstrapping the sample and run the run the output sample testing.

#bootstrappingSE <- function(SWTIIIModelData, otherSizeMetricsData, model, niters, confidence_interval){
  set.seed(42)
  # create 10000 samples of size 50
  N <- nrow(dataset)
  #niters <- 10
  #sample_size <- as.integer(0.83*N)
  sample_size <- N
  
  niters <- 100
  
  confidence_interval <- 0.83
  
  nfold = 2
  
  folds <- cut(seq(1,nrow(dataset)),breaks=nfold,labels=FALSE)
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  accuracy_metrics <- c('mmre','pred15','pred25','pred50', 'mdmre', 'mae')
  
  nmetrics <- length(accuracy_metrics)
  
  predRange <- 50
  
  #data structure to hold the data for 10 fold cross validation
  
  model_accuracy_indice <- c()
  for(i in 1:length(modelNames)){
    modelName = modelNames[i]
    model_accuracy_indice <- cbind(model_accuracy_indice, paste(modelName, accuracy_metrics, sep="_"));
  }
  
  iterResults <- matrix(nrow=niters, ncol=nmodels*nmetrics)
  colnames(iterResults) <- model_accuracy_indice
  
  iterResults1 <- array(0,dim=c(predRange,nmodels,niters+1))

  for (i in 1:niters){
    
    if(i == 1){
      resample = dataset
    }
    else{
      resampleIndexes <- sample(1:N, size=sample_size, replace=TRUE)
      resample = dataset[resampleIndexes,]
    }
    
    #sampleIndexes <- sample(1:N, size=sample_size)
    # train:test = 40:10
    train_data_size = as.integer(0.8*sample_size)
    trainIndexes <- sample(1:N, size=train_data_size)
    
    trainData <- resample[trainIndexes, ]
    testData <- resample[-trainIndexes, ]
    
    eval_metrics = c()
    eval_pred = c()
    
    for(j in 1:nmodels){
      
      modelName <- modelNames[j]
      
      model = fit(trainData, modelNames[j], models[[j]])
      
      predicted = m_predict(model, testData)
      #print(predicted)
      names(predicted) <- rownames(testData)
      print(predicted)
      
      actual = testData$Effort
      names(actual) <- rownames(testData)
      #print(actual)
      
      intersectNames <- intersect(names(predicted), names(actual))
      
      model_eval_predict = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames] )
      print(model_eval_predict)
      
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
    
    if (i%%500 == 0){
      print(i)
    }
    
    iterResults[i,] = eval_metrics
    iterResults1[,,i] = eval_pred
  }
  
  #confidence_interval <- 0.83
  t <- confidence_interval/2
  
  # estimatied value falls in [mean(x) - t * se, mean(m) + t * se]
  calEstimation <- function(x){
    return(c(mean(x)-t*sd(x), mean(x), mean(x)+t*sd(x)))
  }
  
  bsEstimations <- apply(iterResults, 2, calEstimation)  # 3*54 matrix
  colnames(bsEstimations) <- model_accuracy_indice
  rownames(bsEstimations) <- c('lower','mean','upper')
  
  ret <- list(bsEstimations = bsEstimations, iterResults = iterResults)
}

