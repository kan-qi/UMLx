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

modelProfile <- function(models, dataset){
  #dataset <- modelData
  #models <- trainedModels
  profileData <- matrix(nrow=nrow(dataset), ncol=0)
  profileData <- as.data.frame(profileData)
  rownames <-rownames(dataset)
  rownames(profileData) <- rownames
  
  modelNames = names(models)
  print(modelNames)
  
  nmodels <- length(modelNames)
  
  for(i in 1:nmodels){
    modelName <- modelNames[i]
    
    print(modelName)
    
    model_profile_data = m_profile(models[[i]], dataset)
    
    colnames <- colnames(model_profile_data)
    
    for(j in 1:length(colnames)){
     profileData[, colnames[j]] <- model_profile_data[, colnames[j]]
    }
    
  }
  
  profileData
}

modelSave <- function(models){
  
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
  #dataset <- modelData
  goodness_fit_metrics <- c("R2")
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
  #dataset = modelData
  
  modelNames = names(models)
  #print(modelNames)
  
  nmodels <- length(modelNames)
  
  nmetrics <- length(fit_metrics)
  
  eval_metric_results = list()
  
  for(j in 1:nmodels){
    modelName <- modelNames[j]
    
    print(modelNames[j])
    
    eval_metric_results[[modelName]] = list()
    
    model = fit(dataset, modelNames[j], models[[j]])
    #model = structure(model, class="klasso_lnr")
    predicted = m_predict(model, dataset)
    
    #print(predicted)
    actual = dataset$Effort
    names(actual) <- rownames(dataset)
    #print(actual)
    
    intersectNames <- intersect(names(predicted), names(actual))
    #print(intersectNames)
    
    model_eval_fit = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
    #print(model_eval_predict)
    
    eval_metric_results[[modelName]]$model_eval_fit = model_eval_fit
    
    #calculate R2 and Eta-squared based on the predicted and actual values.
    #eta_squared may not be applicable
    #npoints <- nrow(model_eval_fit)
    #grouping <- c(1:npoints, 1:npoints)
    #anova <- aov( c(model_eval_fit$predicted, model_eval_fit$actual) ~ grouping )
    #eta_squared <- etaSquared(anova)[1,1]
    #print(eta_squared)
    
    if("R2" %in% fit_metrics){
    meanActual <- mean(model_eval_fit$actual)
    eval_metric_results[[modelName]]$r_squared <- 1-sum((model_eval_fit$actual - model_eval_fit$predicted)^2)/sum((model_eval_fit$actual - meanActual)^2)
    #print(r_squared)
    }
    
    #f-test
    if("f-test" %in% fit_metrics){
    eval_metric_results[[modelName]]$f_test = var.test(model_eval_fit$actual - model_eval_fit$predicted, model_eval_fit$actual - meanActual)
    }
    
    #LM <- lm( c(model_eval_fit$predicted, model_eval_fit$actual) ~ grouping );
    #r_squared <- summary(LM)$r.squared
    #print(r_squared)
    
    #add the evaluation results to the "eval_metric_results"
    #eval_metric_results[[modelName]] = list(eta_squared = eta_squared, 
    #                                        r_squared = r_squared,
    #                                        model_eval_fit = model_eval_fit,
    #                                        f_test = f_test)
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
	  #j = 2
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
    
    if (i%%500 == 0){
      print(i)
    }
    
    #iterResults[i,] = eval_metrics
    #iterResults1[,,i] = eval_pred
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
  
  ret <- list(bsEstimations = bsEstimations, iterResults = iterResults, iterResults1=iterResults1)
}

