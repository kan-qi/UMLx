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
  df <- dataset
  # df <- na.omit(df)
  # Create a list of columns to be dropped from the input data frame
  drop <- c("Norm_Factor", "Effort_Norm", "Effort_Norm_UCP", "Effort_Norm_COCOMO", "transaction_file", "Type", "Project", "Type.1", "NUM")
  # Drop columns that are in "drop" list
  data.orig <- subset(df, select=!names(df) %in% drop)
  # str(dataset)
  
  # numeric data only
  numeric_columns <- unlist(lapply(data.orig, is.numeric))
  data.orig <- data.orig[, numeric_columns]
  # data.orig <- data.orig %>% vna.omit() %>% select_if(is.numeric)
  # remove empty columns
  # make a data frame with the max & min value per column
  max_min <- data_frame(max = apply(data.orig, 2, max),
                        min = apply(data.orig, 2, min),
                        columns = names(data.orig))
   
  # vector of useless column names
  useless_columns <- max_min$columns[max_min$min == max_min$max]
  # add  minus signs so select() will remove them
  useless_columns <- paste("-", useless_columns, sep = "")
  # useless_columns
  # remove useless columns
  data.orig <- data.orig %>% select_(.dots = useless_columns)
  
  ## Impute
  library(mice)
  library(randomForest)
  # perform mice imputation, based on random forests.
  miceMod <- mice(data.orig, method="rf", print=FALSE)
  # miceMod <- mice(dataset.orig[, !names(BostonHousing) %in% "Effort"], method="rf")
  # generate the completed data.
  data.imputed <- complete(miceMod)
  # anyNA(dataset)
  data.imputed
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
  cluster
}


## Helper method for predicting and assessing model performances
## https://rstudio-pubs-static.s3.amazonaws.com/31832_8ce70b52528d46cb856c2d99968954b0.html
predictAndMeasure = function(model, model.label, Xtrain, ytrain, Xtest, ytest, timer, grid = NULL, verbose=F) {
  pred = predict(model, Xtrain) 
  RMSE.train = RMSE(obs = ytrain, pred = pred)
  
  pred = predict(model, Xtest) 
  RMSE.test = RMSE(obs = ytest, pred = pred)
  
  # Variable Importance
  # varImp <- varImp(object=model)
  # Plotting variable importance for NNET
  # if (verbose) plot(varImp, main="Variable Importance")
  
  if (verbose) cat("****** RMSE(train) =",RMSE.train," -  RMSE(test) =",RMSE.test,"  --  Time elapsed(sec.):",timer[[3]], "...  \n")
  
  perf.grid = NULL
  if (is.null(grid)) { 
    perf.grid = data.frame(predictor = c(model.label) , RMSE.train = c(RMSE.train) , RMSE.test = c(RMSE.test) , time = c(timer[[3]]))
  } else {
    .grid = data.frame(predictor = c(model.label) , RMSE.train = c(RMSE.train) , RMSE.test = c(RMSE.test) , time = c(timer[[3]]))
    perf.grid = rbind(grid, .grid)
  }
  perf.grid
}

#fit, compare and select model
fitModel <- function(data.train, data.test) {
  # Start parallel processing
  cluster <- startParallelProcessing()
  
  ## Create model control grid
  model.control <- trainControl(method="repeatedcv", # repeated k-fold cross validation
                                number=10, # 10 fold
                                repeats=5, # repeated 5 times
                                allowParallel=TRUE,
                                verboseIter=FALSE)
  
  ## Formula to fit
  form.in <- as.formula(paste("Effort ~", paste(names(data.train), collapse=" + ")))
  ## Print result on the way
  verbose = T
  
  ## Fit Model
  ######################################################## Neural Network NNET
  library(nnet)
  if (verbose) cat("****** Neural Network - NNET ...  \n")
  nnet.grid <- expand.grid(size=c(1, 5, 7),
                           decay=c(0, 0.01, 0.1))
  set.seed(1984); start.time <- proc.time()
  nnet.fit <- train(form.in,
                    data=data.train,
                    method="nnet",
                    trControl=model.control,
                    maxit=1000,
                    tuneLength=5,
                    #tuneGrid=nnet.grid,
                    trtrace=F,
                    linout=1)
  if (verbose) nnet.fit
  timer = proc.time() - start.time
  perf.grid = predictAndMeasure(nnet.fit, "Neural Network - NNET", data.train, data.train$Effort, data.test, data.test$Effort, timer, grid = NULL, verbose)
  
  ## Print performance result
  # perf.grid[order(perf.grid$RMSE.test, decreasing=F),]
  
  # Stop parallel processing
  stopParallelProcessing(cluster)
  
  nnet.fit
}



## Stop running parallel processing cluster
stopParallelProcessing <- function(cluster) {
  stopCluster(cluster)
  registerDoSEQ()
}


m_fit.neuralnet <- function(neuralnet, dataset){
  library(caret)
  library(dplyr)
  
  # Set the seeds
  set.seed(1984)
  
  #clean data
  dataset = clean(dataset)
  
  ## Partition training and testing data set
  # create a list of 80% of the rows from the original dataset we can use for training
  sample_size = floor(0.8*nrow(data.imputed))
  train_index = sample(seq_len(nrow(data.imputed)), size=sample_size)
  # train_index <- createDataPartition(y = data.imputed, p = 0.80, list = FALSE)
  
  # select 80% of data to training and testing the models
  data.train <- data.imputed[train_index,]
  # use the remaining 20% of the data for validation
  data.test <- data.imputed[-train_index,]
  
  ## Preprocess data
  preProcValues <- preProcess(data.train,
                              method=c("center", "scale", "YeoJohnson", "nzv", "pca", "knnImpute"),
                              na.remove = TRUE,
                              pcaComp = 10,
                              k = 5,
                              knnSummary = mean,
                              outcome = NULL,
                              fudge = .2,
                              numUnique = 3)
  
  #fit, compare and select model
  neuralnet$m <- fitModel(data.train, data.test)
  
  #return best model
  neuralnet
}

m_predict.neuralnet <- function(neuralnet, testData){
  predict(neuralnet$m, testData)
}

neuralnet_model <- function(){
  
  #models = list()
  
  # this list should be just for some hyper parameters. For example, the levels of hiden layers. If there is no, return it as empty list.
  list()
  
  #models$neuralnet = neuralnet
  
  ## Data processing ##
  # Set path to input data file
  # filename = "/cloud/project/accuracy_analysis/modelEvaluations-1-3.csv"
  #filename = "/Users/suraj/RedPill/USC/Spring2019/CS590/src/UMLx/data/GitAndroidAnalysis/accuracy_analysis/modelEvaluations-1-3.csv"
  # Read data
  #dataset <- read.csv(filename, header=TRUE, sep=",")
  
  #m_fit.neuralnet(neuralnet, dataset)
  
  #models
  
}

