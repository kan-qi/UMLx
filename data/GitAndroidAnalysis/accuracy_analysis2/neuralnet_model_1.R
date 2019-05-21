#############################################################
#############################################################
# File : Script to fit a neural network to transaction
# analysis data
# 
# Input: Dataset
# Output: A model trained to predict project Effort
#
#############################################################
#############################################################

## Data processing ##
clean <- function(dataset){

  # Create a list of columns to be dropped from the input data frame
  drop <- c("Norm_Factor", "Effort_Norm", "Effort_Norm_UCP", "Effort_Norm_COCOMO", "Effort", "Effort.1")
  # Drop columns that are in "drop" list
  data.orig <- subset(dataset, select=!names(dataset) %in% drop)

  # numeric data only
  numeric_columns <- unlist(lapply(data.orig, is.numeric))
  data.numeric <- data.orig[, numeric_columns]
  data.numeric <- data.frame(apply(data.orig, 2, as.numeric))
  
  # remove near zero variance columns
  nzv_cols <- nearZeroVar(data.numeric)
  if(length(nzv_cols) > 0) data <- data.numeric[, -nzv_cols]
  
  sapply(data, function(x) sum(is.na(x)))
  
  ## Impute
  library(mice)
  library(randomForest)
  # perform mice imputation, based on random forests.
  # print(md.pattern(data))
  miceMod <- mice(data, method="rf", print=FALSE, remove_collinear = TRUE)
  # generate the completed data.
  data.imputed <- complete(miceMod)
  data.imputed$Effort <- dataset$Effort
  return(data.imputed)
}

## Allow parallel processing
startParallelProcessing <- function() {
  ## TODO: For making the result reproducible on parallel processing we need to set the seeds according to:
  ## https://stackoverflow.com/questions/13403427/fully-reproducible-parallel-models-using-caret
  # Library parallel() is a native R library, no CRAN required
  library(parallel)
  # nCores <- detectCores(logical=FALSE)
  # nThreads <- detectCores(logical=TRUE)
  # cat("CPU with",nCores,"cores and",nThreads,"threads detected.\n")
  # load the doParallel/doSNOW library for caret cluster use
  library(doParallel)
  # convention to leave 1 core for OS
  # cluster <- makeCluster(detectCores() - 1)
  cluster <- makeCluster(4)
  registerDoParallel(cluster)
  return(cluster)
}


## Helper method for predicting and assessing model performances
## https://rstudio-pubs-static.s3.amazonaws.com/31832_8ce70b52528d46cb856c2d99968954b0.html
predictAndMeasure = function(model, pcaComp, Xtrain, ytrain, Xtest, ytest, timer, grid = NULL, verbose=F) {
  pred = predict(model, Xtrain) 
  RMSE.train = RMSE(obs = ytrain, pred = pred)
  #print(pred)
  
  pred = predict(model, Xtest) 
  RMSE.test = RMSE(obs = ytest, pred = pred)
  #print(pred)
  
  # Variable Importance
  # varImp <- varImp(object=model)
  # Plotting variable importance for NNET
  # if (verbose) plot(varImp, main="Variable Importance")
  
  if (verbose) cat("****** RMSE(train) =",RMSE.train," -  RMSE(test) =",RMSE.test,"  --  Time elapsed(sec.):",timer[[3]], "...  \n")
  
  perf.grid = NULL
  if (is.null(grid)) { 
    perf.grid = data.frame(pcaComp = pcaComp, RMSE.train = c(RMSE.train), RMSE.test = c(RMSE.test), time = c(timer[[3]]))
  } else {
    .grid = data.frame(pcaComp = pcaComp, RMSE.train = c(RMSE.train), RMSE.test = c(RMSE.test), time = c(timer[[3]]))
    perf.grid = rbind(grid, .grid)
  }
  return(perf.grid)
}

#fit, compare and select model
fitModel <- function(data.train) {
  # Start parallel processing
  cluster <- startParallelProcessing()
  
  ## Create model control grid
  model.control <- trainControl(method="repeatedcv", # repeated k-fold cross validation
                                number=10, # 10 fold
                                repeats=5, # repeated 5 times
                                allowParallel=TRUE,
                                verboseIter=FALSE)
  
  ## Print result on the way
  verbose = F
  
  ## Fit Model
  ######################################################## Neural Network NNET
  library(nnet)
  if (verbose) cat("****** Neural Network - NNET ...  \n")
  nnet.grid <- expand.grid(size=c(1, 5, 7),
                           decay=c(0, 0.01, 0.1))
  set.seed(1984)
  nnet.fit <- train(Effort ~ .,
                    data=data.train,
                    method="nnet",
                    trControl=model.control,
                    maxit=1000,
                    #tuneLength=5,
                    tuneGrid=nnet.grid,
                    trtrace=F,
                    linout=1,
                    verbose=verbose)
  if (verbose) print(nnet.fit)
  
  # Stop parallel processing
  stopParallelProcessing(cluster)

  return(nnet.fit)
}


## Stop running parallel processing cluster
stopParallelProcessing <- function(cluster) {
  stopCluster(cluster)
  registerDoSEQ()
}


neuralnet_model <- function(dataset) {
  library(caret)
  library(dplyr)
  
  # Set the seeds
  set.seed(1984)
  
  # Print results
  verbose = F
  
  #clean data
  # if(verbose) print(names(dataset))
  data <- clean(dataset)
  dims <- names(data)
  if (verbose) cat("Dimentions used for training...\n")
  if (verbose) print(dims)
  
  perf.grid <- list()
  hyperparameters <- list()
  for(pcaComp in seq(6,10)) {
    start.time <- proc.time()
    
    ## Preprocess data
    meta.data.preProcess <- preProcess(data[, names(data) != "Effort"],
                                       method=c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute", "corr"),
                                       na.remove = FALSE,
                                       pcaComp = pcaComp,
                                       k = 5,
                                       knnSummary = mean,
                                       outcome = NULL,
                                       fudge = .2,
                                       numUnique = 3)
    # if (verbose) print(meta.data.preProcess)
    data.pca <- predict(meta.data.preProcess, data[, names(data) != "Effort"])
    #data.pca$Effort <- data$Effort
    
    ## Partition training and testing data set
    # create a list of 80% of the rows from the original dataset we can use for training
    sample_size <- floor(0.8*nrow(data.pca))
    train_index <- sample(seq_len(nrow(data.pca)), size=sample_size)
    #train_index <- createDataPartition(y = data.pca, p = 0.80, list = FALSE)
    
    # select 80% of data to training and testing the models
    Xtrain <- data.pca[train_index,]
    ytrain <- data$Effort[train_index]
    data.train.sub <- cbind(Xtrain, ytrain)
    names(data.train.sub)[pcaComp+1] <- paste("Effort")
    # use the remaining 20% of the data for validation
    Xtest <- data.pca[-train_index,]
    ytest <- data$Effort[-train_index]
    
    #fit, compare and select model
    nnet.model <- fitModel(data.train.sub)
    
    timer = proc.time() - start.time
    perf.grid = predictAndMeasure(nnet.model, pcaComp, Xtrain, ytrain, Xtest, ytest, timer, grid = perf.grid, verbose)
    
    # set hyperparameter values
    RMSE <- perf.grid$RMSE.test[perf.grid$pcaComp == pcaComp]
    if ((nrow(perf.grid) == 1) || (RMSE < min(perf.grid$RMSE.test))) {
      hyperparameters <- c("pcaComp" = pcaComp, "bestTune" = list(nnet.model$bestTune), "dims" = list(c(dims)))
    }
  }
  
  ## Print performance result
  print(perf.grid[order(perf.grid$RMSE.test, decreasing=F),])
  
  if (verbose) print(hyperparameters)
  return(list(hyperparameters = hyperparameters))
}

m_fit.neuralnet <- function(neuralnet, dataset){
  
  library(caret)
  library(dplyr)
  
  # Set the seeds
  set.seed(1984)
  
  # Print results
  verbose = F
  
  #clean data
  data <- clean(dataset)
  dims <- neuralnet$hyperparameters$dims
  data <- data[,dims]
  pcaComp <- neuralnet$hyperparameters$pcaComp
  size <- neuralnet$hyperparameters$bestTune$size
  decay <- neuralnet$hyperparameters$bestTune$decay
  
  ## Preprocess data
  meta.data.preProcess <- preProcess(data[, names(data) != "Effort"],
                                     method=c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute", "corr"),
                                     na.remove = FALSE,
                                     pcaComp = pcaComp,
                                     k = 5,
                                     knnSummary = mean,
                                     outcome = NULL,
                                     fudge = .2,
                                     numUnique = 3)
  if (verbose) print(meta.data.preProcess)
  data.train <- predict(meta.data.preProcess, data[, names(data) != "Effort"])
  data.train$Effort <- data$Effort
  
  # Start parallel processing
  cluster <- startParallelProcessing()
  
  ## Create model control grid
  model.control <- trainControl(method="repeatedcv", # repeated k-fold cross validation
                                number=10, # 10 fold
                                repeats=5, # repeated 5 times
                                allowParallel=TRUE,
                                verboseIter=FALSE)
  
  ## Fit Model
  library(nnet)
  if (verbose) cat("****** Neural Network - NNET ...  \n")
  nnet.grid <- expand.grid(size=size, decay=decay)

  nnet.model <- train(Effort ~ .,
                    data=data.train,
                    method="nnet",
                    trControl=model.control,
                    maxit=1000,
                    tuneGrid=nnet.grid,
                    trtrace=F,
                    linout=1,
                    verbose=verbose)
  if (verbose) print(nnet.model)
  
  # Stop parallel processing
  stopParallelProcessing(cluster)
  neuralnet$m = nnet.model
  neuralnet
}

m_predict.neuralnet <- function(neuralnet, testData){
  library(caret)
  library(dplyr)
  
  # Set the seeds
  set.seed(1984)
  
  # Print results
  verbose = F
  
  data <- clean(testData)
  dims <- neuralnet$hyperparameters$dims
  data <- data[,dims]
  pcaComp <- neuralnet$hyperparameters$pcaComp
  meta.data.preProcess <- preProcess(data[, names(data) != "Effort"],
                                     method=c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute", "corr"),
                                     na.remove = FALSE,
                                     pcaComp = pcaComp,
                                     k = 5,
                                     knnSummary = mean,
                                     outcome = NULL,
                                     fudge = .2,
                                     numUnique = 3)
  if (verbose) print(meta.data.preProcess)
  data.test <- predict(meta.data.preProcess, data[, names(data) != "Effort"])
  data.test$Effort <- data$Effort
  predict(neuralnet$m, data.test)
}

## Stub for testing
#filename <- "/Users/suraj/RedPill/USC/Spring2019/CS590/src/UMLx/data/GitAndroidAnalysis/accuracy_analysis2/dsets/android_dataset_4_26.csv"
#modelData <- read.csv(filename, header=TRUE, sep=",")
#rownames(modelData) <- modelData$Project
#modelData$Project <- NULL
#neuralnet <- list()
#neuralnet$hyperparameters <- neuralnet_model(modelData)
#neuralnet$m <- m_fit.neuralnet(neuralnet, modelData)
#print(neuralnet)
#m_predict.neuralnet(neuralnet, modelData)
