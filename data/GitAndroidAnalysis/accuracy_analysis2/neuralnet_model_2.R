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
clean <- function(dataset) {
  # Create a list of columns to be dropped from the input data frame
  drop <- c("Norm_Factor", "Effort_Norm", "Effort_Norm_UCP", "Effort_Norm_COCOMO", "Effort", "Effort.1")
  data.orig <- subset(dataset, select=!names(dataset) %in% drop)

  # Keep numeric data only
  numeric_columns <- unlist(lapply(data.orig, is.numeric))
  data.numeric <- data.orig[, numeric_columns]
  data.numeric <- data.frame(apply(data.orig, 2, as.numeric))
  
  # Remove near zero variance columns
  nzv_cols <- nearZeroVar(data.numeric)
  if(length(nzv_cols) > 0) data <- data.numeric[, -nzv_cols]
  
  sapply(data, function(x) sum(is.na(x)))
  
  ## Impute
  library(mice)
  library(randomForest)
  
  # perform mice imputation, based on random forests.
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


## Stop running parallel processing cluster
stopParallelProcessing <- function(cluster) {
  stopCluster(cluster)
  registerDoSEQ()
}


## Helper method for predicting and assessing model performances
## https://rstudio-pubs-static.s3.amazonaws.com/31832_8ce70b52528d46cb856c2d99968954b0.html
predictAndMeasure <- function(model, pcaComp, x_train, y_train, x_test, y_test, timer, grid=NULL, verbose=F) {
  pred = predict(model, x_train) 
  RMSE_train = RMSE(obs=y_train, pred=pred)
  
  pred = predict(model, x_test) 
  RMSE_test = RMSE(obs=y_test, pred=pred)
  
  # Variable Importance
  # varImp <- varImp(object=model)
  # Plotting variable importance for NNET
  # if (verbose) plot(varImp, main="Variable Importance")
  
  if (verbose) cat("****** RMSE(train) =", RMSE_train, " -  RMSE(test) =", RMSE_test, "  --  Time elapsed(sec.):", timer[[3]], "...  \n")
  
  perf_grid = NULL
  if (is.null(grid)) { 
    perf_grid = data.frame(pcaComp=pcaComp, RMSE.train=c(RMSE_train), RMSE.test=c(RMSE_test), time=c(timer[[3]]))
  } else {
    .grid = data.frame(pcaComp=pcaComp, RMSE.train=c(RMSE_train), RMSE.test=c(RMSE_test), time=c(timer[[3]]))
    perf_grid = rbind(grid, .grid)
  }
  return(perf_grid)
}


# Fit, compare and select model
fitModel <- function(data.train, verbose=F) {
  # Start parallel processing
  cluster <- startParallelProcessing()
  
  # Create model control grid
  model.control <- trainControl(method="repeatedcv", # repeated k-fold cross validation
                                number=10, # 10 fold
                                repeats=5, # repeated 5 times
                                allowParallel=TRUE,
                                verboseIter=FALSE)
  
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


neuralnet_model <- function(dataset, verbose=F) {
  library(caret)
  library(dplyr)
  
  set.seed(1984)  # set a seed
  
  # Clean dataset to keep features that we care about only
  data <- clean(dataset)
  #dims <- names(data)
  
  if (verbose) {
    cat("Dimentions used for training...\n")
    print(names(data))
    print(dims)
  }
  
  perf_grid <- list()
  hyperparameters <- list()
  methods <- c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute", "corr")
  train_data_size <- floor(0.8 * nrow(data))
  for(pcaComp in seq(6, 10)) {
    start_time <- proc.time()
    
    preprocessed_data <- preProcess(data[, names(data) != "Effort"],
                                    method=methods,
                                    na.remove=F,
                                    pcaComp=pcaComp,
                                    k=5,
                                    knnSummary=mean,
                                    outcome=NULL,
                                    fudge=0.2,
                                    numUnique=3)
    
    data_pca <- predict(preprocessed_data, data[, names(data) != "Effort"])
    #data.pca$Effort <- data$Effort
    
    ## Partition training and testing data set
    # create a list of 80% of the rows from the original dataset we can use for training
    train_index <- sample(seq_len(nrow(data_pca)), size=train_data_size)
    #train_index <- createDataPartition(y = data.pca, p = 0.80, list = FALSE)
    
    x_train <- data_pca[train_index,]
    y_train <- data$Effort[train_index]
    data.train.sub <- cbind(x_train, y_train)
    names(data.train.sub)[pcaComp + 1] <- paste("Effort")
    
    # use the remaining 20% of the data for validation
    x_test <- data_pca[-train_index,]
    y_test <- data$Effort[-train_index]
    
    #fit, compare and select model
    nnet_model <- fitModel(data.train.sub)
    
    timer = proc.time() - start_time
    perf_grid = predictAndMeasure(nnet_model, pcaComp, x_train, y_train, x_test, y_test, timer, grid=perf_grid, verbose)
    
    # set hyperparameter values
    RMSE <- perf_grid$RMSE.test[perf_grid$pcaComp == pcaComp]
    if ((nrow(perf_grid) == 1) || (RMSE < min(perf_grid$RMSE.test))) {
      hyperparameters <- c("pcaComp" = pcaComp, "bestTune" = list(nnet_model$bestTune), "dims" = list(c(dims)))
    }
  }
  
  ## Print performance result
  print(perf_grid[order(perf_grid$RMSE.test, decreasing=F),])
  
  if (verbose) print(hyperparameters)
  return(list(hyperparameters = hyperparameters))
}


m_fit.neuralnet <- function(neuralnet, dataset, verbose=F) {
  library(caret)
  library(dplyr)
  
  # Set the seeds
  set.seed(1984)  # set a seed
  
  data <- clean(dataset)
  #dims <- neuralnet$hyperparameters$dims
  #data <- data[, dims]
  dims <- names(data)
  
  pcaComp <- neuralnet$hyperparameters$pcaComp
  size <- neuralnet$hyperparameters$bestTune$size
  decay <- neuralnet$hyperparameters$bestTune$decay
  
  ## Preprocess data
  methods <- c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute", "corr")
  preprocessed_data <- preProcess(data[, names(data) != "Effort"],
                                  method=methods,
                                  na.remove=F,
                                  pcaComp=pcaComp,
                                  k=5,
                                  knnSummary = mean,
                                  outcome=NULL,
                                  fudge=.2,
                                  numUnique=3)
  
  neuralnet$pca <- preprocessed_data
  
  if (verbose) print(preprocessed_data)
  data_train <- predict(preprocessed_data, data[, names(data) != "Effort"])
  data_train$Effort <- data$Effort
  
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
                      data=data_train,
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
  
  #
  neuralnet$cols_removed =  dims;
  
  if (verbose) cat("finished training\n")
  return(neuralnet)
}


m_predict.neuralnet <- function(neuralnet, testData, verbose=F) {
  library(caret)
  library(dplyr)
  
  #
  cols_removed = neuralnet$cols_removed;
  testData = testData[-cols_removed, ];
  
  set.seed(1984)  # set a seed
  
  data <- clean(testData)
  
  dims <- neuralnet$hyperparameters$dims
  data <- data[,dims]
  pcaComp <- neuralnet$hyperparameters$pcaComp
  pca <- neuralnet$pca
  
  # methods <- c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute", "corr")
  # meta.data.preProcess <- preProcess(data[, names(data) != "Effort"],
  #                                    method=methods,
  #                                    na.remove=F,
  #                                    pcaComp=pcaComp,
  #                                    k=5,
  #                                    knnSummary=mean,
  #                                    outcome=NULL,
  #                                    fudge=0.2,
  #                                    numUnique=3)
  
  if (verbose) print(pca)
  
  data_test <- predict(pca, data[, names(data) != "Effort"])
  data_test$Effort <- data$Effort
  predictions <- as.integer(predict(neuralnet$m, data_test))
  names(predictions) <- rownames(testData)
  return(predictions)
}

## Stub for testing
# filename <- "temp/android_dataset_6_4.csv"
# modelData <- read.csv(filename, header=TRUE, sep=",", row.names="Project")
# modelData$Project <- NULL
# 
# neuralnet <- list()
# neuralnet <- neuralnet_model(modelData)
# neuralnet <- m_fit.neuralnet(neuralnet, modelData)
# print(neuralnet)
# predictions <- m_predict.neuralnet(neuralnet, modelData)