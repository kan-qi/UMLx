# the set of effort estimation accuracy measures
mre <- function(x) abs(x[1] - x[2])/x[2]
mmre <- function(mre) mean(mre)
pred15 <- function(mre) length(mre[mre<=0.15])/length(mre)
pred25 <- function(mre) length(mre[mre<=0.25])/length(mre)
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
  #print(modelNames)
  
  nmodels <- length(modelNames)
  
  for(i in 1:nmodels){
    modelName <- modelNames[i]
    
    print(modelName)
    
    model_profile_data = m_profile(trainedModels[[i]], dataset)
    
    if(ncol(model_profile_data) == 0){
      next
    }
    
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
    
    #m_save(model)
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

modelBenchmarkIndividual <- function(models, dataset, benchmarkResults){
  
  #modelsTest1 <- models
  #models <- modelsTest1
  benchmarkResultsUpdate <- modelBenchmark(models, dataset)
  
  benchmarkResults <- updateBenchmarkResults(benchmarkResults, benchmarkResultsUpdate)
  
  benchmarkResults
}

#only benchmark for the models in the list. Update the results in the benchmarkresults for the models
updateBenchmarkResults <- function(benchmarkResults, benchmarkResultsUpdate){
  #benchmarkResultsTest1 <- benchmarkResults
  #benchmarkResults <- benchmarkResultsTest1
  fitResults <- benchmarkResults$fitResults
  cvResults <- benchmarkResults$cvResults
  bsResults <- benchmarkResults$bsResults
  model_names <- benchmarkResults$model_names
  accuracy_metrics = benchmarkResults$accuracy_metrics
  goodness_fit_metrics = benchmarkResults$goodness_fit_metrics
  
  accuracy_results <- cvResults$accuracyResults
  avgPreds <- cvResults$avgPreds
  foldResults <- cvResults$foldResults
  foldResults1 <- cvResults$foldResults1
  #print(foldResults1)
  
  bsEstimations <- bsResults$bsEstimations
  iterResults <- bsResults$iterResults
  iterResults1 <- bsResults$iterResults1
  
  #read the updated information
  fitResults_update <- benchmarkResultsUpdate$fitResults
  
  cvResults_update <- benchmarkResultsUpdate$cvResults
  bsResults_update <- benchmarkResultsUpdate$bsResults
  
  model_names_update <- benchmarkResultsUpdate$model_names
  accuracy_metrics_update = benchmarkResultsUpdate$accuracy_metrics
  goodness_fit_metrics_update = benchmarkResultsUpdate$goodness_fit_metrics
  
  model_indices_update <- match(model_names_update, model_names)
  
  accuracy_results_update <- cvResults_update$accuracyResults
  avgPreds_update <- cvResults_update$avgPreds
  foldResults_update <- cvResults_update$foldResults
  foldResults1_update <- cvResults_update$foldResults1
  
  bsEstimations_update <- bsResults_update$bsEstimations
  iterResults_update <- bsResults_update$iterResults
  iterResults1_update <- bsResults_update$iterResults1
  
  #update fit results
  for(i in 1:length(model_names_update)){
    fitResults[[model_names_update[i]]] = fitResults_update[[model_names_update[i]]] 
  }
  #fitResults[[model_names_update]] = fitResults_update[[model_names_update]]
  
  model_labels_update <- c()
  for(i in 1:length(model_names_update)){
    for(j in 1:length(accuracy_metrics_update)){
      model_labels_update = c(model_labels_update, model_names_update[i])
    }
  }
  #print(model_labels_update)
  
  metric_labels_update <- c()
  for(i in 1:length(model_names_update)){
    for(j in 1:length(accuracy_metrics_update)){
      metric_labels_update = c(metric_labels_update, accuracy_metrics_update[j])
    }
  }
  
  model_accuracy_labels_update <- paste(model_labels_update, metric_labels_update, sep="_")
  #print(model_accuracy_labels_update)
  
  accuracy_results[model_accuracy_labels_update] = accuracy_results_update[model_accuracy_labels_update]
  avgPreds = as.data.frame(avgPreds)
  avgPreds_update = as.data.frame(avgPreds_update)
  avgPreds[model_names_update] = avgPreds_update[model_names_update]
  foldResults = as.data.frame(foldResults)
  foldResults_update = as.data.frame(foldResults_update)
  foldResults[model_accuracy_labels_update] = foldResults_update[model_accuracy_labels_update]
  newCols = sum(is.na(model_indices_update))
  newDims = dim(foldResults1)+c(0,newCols, 0)
  foldResults1_new <- array(0,dim=newDims)
  #print(model_indices_update)
  for(i in 1:dim(foldResults1)[3]){
    addedCols = 0
    for(j in 1:dim(foldResults1)[2]){
      #print(foldResults1[,j,i])
      foldResults1_new[,j,i] = foldResults1[,j,i]
    }
    for(j in 1:length(model_indices_update)){
      #print(model_indices_update[j])
      if(is.na(model_indices_update[j])){
        addedCols = addedCols+1
        #print(dim(foldResults1)[2]+addedCols)
        foldResults1_new[,dim(foldResults1)[2]+addedCols,i] = foldResults1_update[,j,i]
      }
      else{
        foldResults1_new[,model_indices_update[j],i] = foldResults1_update[,j,i]
      }
    }
  }
  #print(foldResults1_new)
  
  cvResults$accuracyResults <- accuracy_results
  cvResults$avgPreds <- avgPreds
  cvResults$foldResults <- foldResults
  cvResults$foldResults1 <- foldResults1_new
  
  bsEstimations = as.data.frame(bsEstimations)
  bsEstimations_update = as.data.frame(bsEstimations_update)
  bsEstimations[model_accuracy_labels_update] = bsEstimations_update[model_accuracy_labels_update]
  print(bsEstimations)
  iterResults = as.data.frame(iterResults)
  iterResults_update = as.data.frame(iterResults_update)
  iterResults[model_accuracy_labels_update] = iterResults_update[model_accuracy_labels_update]
  
  newCols = sum(is.na(model_indices_update))
  newDims = dim(iterResults1)+c(0,newCols, 0)
  iterResults1_new <- array(0,dim=newDims)
  #print(model_indices_update)
  for(i in 1:dim(iterResults1)[3]){
    addedCols = 0
    for(j in 1:dim(iterResults1)[2]){
      #print(foldResults1[,j,i])
      iterResults1_new[,j,i] = iterResults1[,j,i]
    }
    for(j in 1:length(model_indices_update)){
      #print(model_indices_update[j])
      if(is.na(model_indices_update[j])){
        addedCols = addedCols+1
        #print(dim(foldResults1)[2]+addedCols)
        iterResults1_new[,dim(iterResults1)[2]+addedCols,i] = iterResults1_update[,j,i]
      }
      else{
        iterResults1_new[,model_indices_update[j],i] = iterResults1_update[,j,i]
      }
    }
  }
  
  bsResults$bsEstimations <- bsEstimations
  bsResults$iterResults <- iterResults
  bsResults$iterResults1 <- iterResults1_new
  
  benchmarkResults$fitResults = fitResults
  benchmarkResults$cvResults = cvResults
  benchmarkResults$bsResults = bsResults
  benchmarkResults$model_names = c(model_names, model_names_update[is.na(model_indices_update)])
  benchmarkResults$accuracy_metrics = accuracy_metrics
  benchmarkResults$goodness_fit_metrics = goodness_fit_metrics
  benchmarkResults
}

#modelBenchmark would preform goodness of fit, cross validation, and bootrapping significance test
modelBenchmark <- function(models, dataset, config=list()){
  #dataset <- modelData
  
  #evaluating the goodness of fit for the compared models using R^2
  #goodness_fit_metrics <- c("R2", "f_test")
  fitResults <- evalFit(models, dataset, config$goodness_fit_metrics)
  
  #effort estimation accuracy metrics
  #accuracy_metrics <- c('mmre','pred15','pred25','pred50', "mdmre", "mae", "predRange")
  #evaluate out-of-sample accuaracy using k-fold cross validation
  #nfold = 5
  cvResults <- cv(models, dataset, config$cv_accuracy_metrics, config$cv_nfold)
  #evaluate sampling distributions using bootstrapping
  #niters = 1000, confidence_level = 0.83
  bsResults <- bootstrappingSE(models, dataset, config$bs_accuracy_metrics, config$bs_niters, config$bs_confidence_level)
  ret <-list(
    goodness_fit_metrics = config$goodness_fit_metrics,
    fitResults = fitResults,
    cvResults = cvResults, 
    bsResults = bsResults,
    model_names = names(models)
  )
}

evalFit <- function(models, dataset, fit_metrics = c("R2", "f_test")){
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
    #print(predicted)
    
    actual = dataset$Effort
    names(actual) <- rownames(dataset)
    #print(actual)
    
    intersectNames <- intersect(names(predicted), names(actual))
    #print(intersectNames)
    
    model_eval_fit = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
    #print(actual[intersectNames])
    
    eval_metric_results[[modelName]]$model_eval_fit = model_eval_fit
    
    if("R2" %in% fit_metrics){
      meanActual <- mean(model_eval_fit$actual)
      eval_metric_results[[modelName]]$R2 <- 1-sum((model_eval_fit$actual - model_eval_fit$predicted)^2)/sum((model_eval_fit$actual - meanActual)^2)
      #print(r_squared)
    }
    
    #f-test
    if("f_test" %in% fit_metrics){
      eval_metric_results[[modelName]]$f_test = var.test(model_eval_fit$actual - model_eval_fit$predicted, model_eval_fit$actual - meanActual)$p.value
    }
    
  }
  
  eval_metric_results
}

# The cross validation process to evaluate the out-of-sample accuracy
cv <- function(models, dataset, accuracy_metrics = c('mmre','pred15','pred25','pred50', 'mdmre', 'mae', 'predRange50'), nfold = 5){
  
  #dataset = modelData
  #accuracy_metrics = c('mmre','pred15','pred25','pred50', 'mdmre', 'mae', 'predRange50')
  #nfold = 5
  
  folds <- cut(seq(1,nrow(dataset)),breaks=nfold,labels=FALSE)
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  nmetrics <- length(accuracy_metrics)
  
  predRange <- 2
  predRangeStr <- grep('predRange*', accuracy_metrics, value = TRUE)[1]
  if(!is.na(predRangeStr)){
    predRange = as.numeric(substring(predRangeStr, 10))
  }
  
  #predRange <- 50
  
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
    
    #eval_metrics = c()
    #eval_pred = c()
    #print(i)
    for(j in 1:nmodels){
      #j = 2
      modelName <- modelNames[j]
      
      print(modelName)
      
      model = fit(trainData, modelNames[j], models[[j]])
      
      #print(testData)
      
      #m_predict(model, testData)
      
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
        foldResults[i, paste(modelName, "mae", sep="_")] = mae(model_eval_predict)
      }
      
      #eval_metrics <- c(
      #  eval_metrics, model_eval_mmre,model_eval_pred15,model_eval_pred25,model_eval_pred50, model_eval_mdmre, model_eval_mae
      #)
      
      #print(eval_metrics)
      predRangeResults <- predR(model_eval_mre, predRange)
      foldResults1[, j, i] = predRangeResults
      foldResults[i, paste(modelName, paste("predRange", predRange, sep=""), sep="_")] = mean(predRangeResults)
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
  avgPreds <- as.data.frame(avgPreds)
  foldResults <- as.data.frame(foldResults)
  
  ret <-list(accuracyResults = accuracyResults, avgPreds = avgPreds, foldResults = foldResults, foldResults1 = foldResults1)
  
}

testIdenticalRows <- function(row_names){
  #row_names = c()
  #row_names = c("Timber_S1W1L1_2019-4-29@1559141370065.2", "Timber_S1W1L1_2019-4-29@1559141370065.1", "Timber_S1W1L1_2019-4-29@1559141370065")
  if(length(row_names) > 1){
    for(i in 1:length(row_names)){
      # print(i)
      g <- regexpr("\\.[^\\.]*$", row_names[i])
      if(g[[1]] > 1){
        row_names[i] = substr(row_names[i], 1, g[[1]]-1)
      }
      #print(row_names[i])
    }
  }
  
  length(unique(row_names))
}

#bootstrapping to evaluate the statistical significance of the accuracy improvements
bootstrappingSE <- function(models, dataset, accuracy_metrics = c('mmre','pred15','pred25','pred50', 'mdmre', 'mae', 'predRange50'), niters = 1000, confidence_level = 0.83){
  
  set.seed(42)
  #create 10000 samples of size 50
  N <- nrow(dataset)
  #niters <- 10
  #sample_size <- as.integer(0.83*N)
  #sample_size <- N
  
  
  #niters <- 100
  
  modelNames = names(models)
  
  nmodels <- length(modelNames)
  
  #accuracy_metrics <- c('mmre','pred15','pred25','pred50', 'mdmre', 'mae')
  
  nmetrics <- length(accuracy_metrics)
  
  predRange <- 1
  predRangeStr <- grep('predRange*', accuracy_metrics, value = TRUE)[1]
  if(!is.na(predRangeStr)){
    predRange = as.numeric(substring(predRangeStr, 10))
  }
  
  #predRange <- 50
  
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
    print(paste("iter: ", i, sep=""))
    #resample = data.frame()
    if(i == 1){
      resample = dataset
    }
    else{
      resampleIndexes = c()
      while(length(unique(resampleIndexes)) <= 1){
        resampleIndexes <- sample(1:N, size=N, replace=TRUE)
        #print("bootstrap indexes")
        #print(resampleIndexes)
        #print(sample(1:5, size=5, replace=TRUE)
      }
      #resample = dataset[resampleIndexes,]
    }
    #print(rownames(resample))
    #sampleIndexes <- sample(1:N, size=sample_size)
    # train:test = 40:10
    train_data_size = as.integer(0.8*N)
    trainData <- NULL
    trainIndexes = NULL
    trainDataRows <- c()
    while(testIdenticalRows(trainDataRows) <= 1){
      trainIndexes <- sample(1:N, size=train_data_size, replace=FALSE)
      #print("train indexes")
      #print(trainIndexes)
      trainData <- resample[trainIndexes, ]
      trainDataRows = rownames(trainData)
      #print(sample(1:5, size=5, replace=TRUE)
    }
    
    testData <- resample[-trainIndexes, ]
    #print(trainIndexes)
    #eval_metrics = c()
    #eval_pred = c()
    
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
        iterResults[i, paste(modelName, "mae", sep="_")] = mae(model_eval_predict)
      }
      
      #eval_metrics <- c(
      #  eval_metrics, model_eval_mmre,model_eval_pred15,model_eval_pred25,model_eval_pred50, model_eval_mdmre, model_eval_mae
      #)
      
      
      #print(eval_metrics)
      
      predRangeResults <- predR(model_eval_mre, predRange)
      iterResults1[, j, i] = predRangeResults
      iterResults[i, paste(modelName, paste("predRange", predRange, sep=""), sep="_")] = mean(predRangeResults)
      
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
    x = na.omit(x)
    return(c(quantile(x, 0.5-confidence_level/2), mean(x), quantile(x, 0.5+confidence_level/2)))
  }
  
  bsEstimations <- apply(iterResults, 2, calEstimation)  # 3*54 matrix
  colnames(bsEstimations) <- model_accuracy_indice
  rownames(bsEstimations) <- c('lower','mean','upper')
  
  bsEstimations <- as.data.frame(bsEstimations)
  iterResults <- as.data.frame(iterResults)
  
  ret <- list(bsEstimations = bsEstimations, iterResults = iterResults, iterResults1=iterResults1)
}

