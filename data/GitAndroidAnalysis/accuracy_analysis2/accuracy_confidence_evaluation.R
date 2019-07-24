# the set of effort estimation accuracy measures
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

# the model profile function, which profiles intermediate analysis data.
modelProfile <- function(trainedModels, dataset){
  #dataset <- modelData
  
  profileData <- matrix(nrow=nrow(dataset), ncol=0)
  profileData <- as.data.frame(profileData)
  rownames <-rownames(dataset)
  rownames(profileData) <- rownames
  
  modelNames = names(trainedModels)
  print(modelNames)
  
  nmodels <- length(modelNames)
  
  for(i in 1:nmodels){
    modelName <- modelNames[i]
    
    print(modelName)
    
    model_profile_data = m_profile(trainedModels[[i]], dataset)
    
    colnames <- colnames(model_profile_data)
    
    for(j in 1:length(colnames)){
     profileData[, colnames[j]] <- model_profile_data[, colnames[j]]
    }
    
  }
  
  #attach the effort data
  profileData[, "Effort"] = dataset$Effort
  
  profileData
}

# the model save function, which saves trained models to files.
modelSave <- function(models){
  
}

# the batch method to train the models. A list of trained models are generated.
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

#the batch method to predict using the trained models.
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

#modelBenchmark would preform goodness of fit, cross validation, and bootrapping significance test
modelBenchmark <- function(models, dataset){
  #dataset <- modelData
  
  #evaluating the goodness of fit for the compared models using R^2
  goodness_fit_metrics <- c("R2", "f-test")
  fitResults <- evalFit(models, dataset, goodness_fit_metrics)
  
  accuracy_metrics <- c('mmre','pred15','pred25','pred50', "mdmre", "mae", "predRange")
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

evalFit <- function(models, dataset, fit_metrics = c("R2", "f-test")){
  #dataset = modelData
  
  modelNames = names(models)
  #print(modelNames)
  
  nmodels <- length(modelNames)
  
  nmetrics <- length(fit_metrics)
  
  eval_metric_results = list()
  
  for(i in 1:nmodels){
    modelName <- modelNames[i]
    
    print(modelNames[i])
    
    eval_metric_results[[modelName]] = list()
    
    model = fit(dataset, modelNames[i], models[[i]])
    
    predicted = m_predict(model, dataset)
    
    actual = dataset$Effort
    names(actual) <- rownames(dataset)
    #print(actual)
    
    intersectNames <- intersect(names(predicted), names(actual))
    #print(intersectNames)
    
    model_eval_fit = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
    #print(model_eval_predict)
    
    eval_metric_results[[modelName]]$model_eval_fit = model_eval_fit
    
    if("R2" %in% fit_metrics){
    meanActual <- mean(model_eval_fit$actual)
    eval_metric_results[[modelName]]$r_squared <- 1-sum((model_eval_fit$actual - model_eval_fit$predicted)^2)/sum((model_eval_fit$actual - meanActual)^2)
    #print(r_squared)
    }
    
    #f-test
    if("f-test" %in% fit_metrics){
    eval_metric_results[[modelName]]$f_test = var.test(model_eval_fit$actual - model_eval_fit$predicted, model_eval_fit$actual - meanActual)
    }
    
  }
  
  eval_metric_results
}

# The cross validation process to evaluate the out-of-sample accuracy
cv <- function(models, dataset, accuracy_metrics = c('mmre','pred15','pred25','pred50', 'mdmre', 'mae', 'predRange')){

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
  print(paste("iter:", i, sep=""))
	#Segement your data by fold using the which() function
	testIndexes <- which(folds==i,arr.ind=TRUE)
	
	testData <- dataset[testIndexes, ]
	trainData <- dataset[-testIndexes, ]
	
	eval_metrics = c()
	eval_pred = c()
	print(i)
	for(j in 1:nmodels){
	  #j = 2
	  modelName <- modelNames[j]
	  
	  print(modelName)
	  
	  model = fit(trainData, modelNames[j], models[[j]])
	  
	  predicted = as.vector(m_predict(model, testData))
	  names(predicted) <- rownames(testData)
	  #print(predicted)
	  
	  actual = testData$Effort
	  names(actual) <- rownames(testData)
	  
	  #print(actual)
	  
	  intersectNames <- intersect(names(predicted), names(actual))
	  
	  model_eval_predict = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
	  #print(model_eval_predict)
	  
	  eval_metric_results = list()
	  
	  model_eval_mre = apply(model_eval_predict, 1, mre)
	  #("mre")
	  #print(model_eval_mre)
	  
	  model_eval_mre <- na.omit(model_eval_mre)
	  #print(model_eval_mre)
	  
	  if("mmre" %in% accuracy_metrics){
	    foldResults[i, paste(modelName,"mmre", sep="_")] = mmre(model_eval_mre)
	  }
	  
	  if("pred15" %in% accuracy_metrics){
	    foldResults[i, paste(modelName, "pred15", sep="_")] = pred15(model_eval_mre)
	  }
	  
	  if("pred25" %in% accuracy_metrics){
	    foldResults[i, paste(modelName, "pred25", sep="_")] = pred25(model_eval_mre)
	  }
	  
	  if("pred50" %in% accuracy_metrics){
	    foldResults[i, paste(modelName, "pred50", sep="_")] = pred50(model_eval_mre)
	  }
	  
	  if("mdmre" %in% accuracy_metrics){
	    foldResults[i, paste(modelName, "mdmre", sep="_")] = mdmre(model_eval_mre)
	  }
	  
	  if("mae" %in% accuracy_metrics){
	    foldResults[i, paste(modelName, "mae", sep="_")] = sum(model_eval_mre)/length(model_eval_predict)
	  }
	  
	  #eval_metrics <- c(
	  #  eval_metrics, model_eval_mmre,model_eval_pred15,model_eval_pred25,model_eval_pred50, model_eval_mdmre, model_eval_mae
	  #)
	  
	  #print(eval_metrics)
	  if("predRange" %in% accuracy_metrics){
	    foldResults1[, j, i] = predR(model_eval_mre, predRange)
	  }
	}
	
	#foldResults[i,] = eval_metrics
	#foldResults1[,,i] = eval_pred
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

ret <-list(accuracyResults = accuracyResults, avgPreds = avgPreds, foldResults = foldResults, foldResults1 = foldResults1)

}

#bootstrapping to evaluate the statistical significance of the accuracy improvements
bootstrappingSE <- function(models, dataset, accuracy_metrics = c('mmre','pred15','pred25','pred50', 'mdmre', 'mae', 'predRange')){

  set.seed(42)
  # create 10000 samples of size 50
  N <- nrow(dataset)
  #niters <- 10
  #sample_size <- as.integer(0.83*N)
  sample_size <- N
  
  niters <- 100
  
  confidence_level <- 0.83
  
  nfold = 2
  
  folds <- cut(seq(1,nrow(dataset)),breaks=nfold,labels=FALSE)
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  #accuracy_metrics <- c('mmre','pred15','pred25','pred50', 'mdmre', 'mae')
  
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
      names(predicted) <- rownames(testData)
      #print(predicted)
      
      actual = testData$Effort
      names(actual) <- rownames(testData)
      #print(actual)
      
      intersectNames <- intersect(names(predicted), names(actual))
      
      model_eval_predict = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames] )
      #print(model_eval_predict)
      
      eval_metric_results = list()
      
      model_eval_mre = apply(model_eval_predict, 1, mre)
      
      #print(modelName)
      
      model_eval_mre <- na.omit(model_eval_mre)
      #print(model_eval_mre)
      
      if("mmre" %in% accuracy_metrics){
        iterResults[i, paste(modelName,"mmre", sep="_")] = mmre(model_eval_mre)
      }
      
      if("pred15" %in% accuracy_metrics){
        iterResults[i, paste(modelName, "pred15", sep="_")] = pred15(model_eval_mre)
      }
      
      if("pred25" %in% accuracy_metrics){
        iterResults[i, paste(modelName, "pred25", sep="_")] = pred25(model_eval_mre)
      }
      
      if("pred50" %in% accuracy_metrics){
        iterResults[i, paste(modelName, "pred50", sep="_")] = pred50(model_eval_mre)
      }
      
      if("mdmre" %in% accuracy_metrics){
        iterResults[i, paste(modelName, "mdmre", sep="_")] = mdmre(model_eval_mre)
      }
      
      if("mae" %in% accuracy_metrics){
        iterResults[i, paste(modelName, "mae", sep="_")] = sum(model_eval_mre)/length(model_eval_predict)
      }
      
      #eval_metrics <- c(
      #  eval_metrics, model_eval_mmre,model_eval_pred15,model_eval_pred25,model_eval_pred50, model_eval_mdmre, model_eval_mae
      #)
      
      
      #print(eval_metrics)
      
      if("predRange" %in% accuracy_metrics){
        iterResults1[,j,i] = predR(model_eval_mre, predRange)
      }
    
    }
    
    #if (i%%500 == 0){
    #  print(i)
    #}
    
  }
  
  #confidence_interval <- 0.83
  #t <- confidence_interval/2
  
  # estimatied value falls in [mean(x) - t * se, mean(m) + t * se]
  calEstimation <- function(x){
    #return(c(mean(x)-t*sd(x), mean(x), mean(x)+t*sd(x)))
    return(c(quantile(x, 0.5-confidence_level/2), mean(x), quantile(x, 0.5+confidence_level/2)))
  }
  
  bsEstimations <- apply(iterResults, 2, calEstimation)  # 3*54 matrix
  colnames(bsEstimations) <- model_accuracy_indice
  rownames(bsEstimations) <- c('lower','mean','upper')
  
  ret <- list(bsEstimations = bsEstimations, iterResults = iterResults, iterResults1=iterResults1)
}

