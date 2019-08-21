library(glmnet)
library(plotmo) # for plot_glmnet
library(mice)
library(randomForest)
library(caret)

lasso_range = function(x, y, k){
  # inputs:
  # x_matrix, a matrix containing independent variables
  # y: vector of dependent varaibles
  # k: the length of sequence
  # output:
  # seq: a sequence of lambdaa from high to low
  #x = x_data
  #y = y_data
  #k = 100
  
  # define my own scale function to simulate that in glmnet
  myscale = function(x) sqrt(sum((x - mean(x)) ^ 2) / length(x))
  
  # normalize x
  sx = as.matrix(scale(x, scale = apply(x, 2, myscale)))
  # sy = as.vector(scale(y, scale = myscale(y)))
  max_lambda = max(abs(colSums(sx * as.vector(y)))) / dim(sx)[1]
  # The default depends on the sample size nobs relative to the number of variables nvars. 
  # If nobs > nvars, the default is 0.0001, close to zero. 
  
  # If nobs < nvars, the default is 0.01. 
  # A very small value of lambda.min.ratio will lead to a saturated fit in the nobs < nvars case. 
  ratio = 0
  if(dim(sx)[1] > dim(sx)[2]){
    ratio = 0.0001
  }else{
    ratio = 0.01
  }
  min_lambda = max_lambda * ratio
  log_seq = seq(from  = log(min_lambda), to = log(max_lambda), length.out = k)
  seq = sort(exp(log_seq), decreasing = T)
  #print(seq)
  return(seq)
}

#lasso_range(x_data,y_data, 100)

cv_lasso_model = function(x_data,y_data){
  set.seed(2)
  lambda_list <- lasso_range(x_data,y_data,100)
  percent = 50
  cvfit = cv.glmnet(x_data,y_data,
                    standardize = T, type.measure = 'mse', nfolds = 5, alpha = 1)
  #print(cvfit$lambda)
  # # 5 fold cross validation
  k <- 5
  # 
  # function to calculate MMRE
  calcMMRE <- function(testData,pred){
    mmre <- abs(testData - pred)/testData
    mean_value <- mean(mmre)
    mean_value
  }
  # # function to calculate PRED
  calcPRED <- function(testData,pred,percent){
    value <- abs(testData - pred)/testData
    percent_value <- percent/100
    pred_value <- value <= percent_value
    mean(pred_value)
  }
  # 
  folds <- cut(seq(1,nrow(x_data)),breaks=k,labels=FALSE)
  mean_mmre <- vector("list",k)
  mean_pred <- vector("list",k)
  overall_mean_mmre <- vector("list",100)
  overall_mean_pred <- vector("list",100)
  for(iterator in seq(1,100)){
    for(i in 1:k){
      testIndexes <- which(folds==i,arr.ind=TRUE)
      testData <- y_data[testIndexes]
      pred <- predict(cvfit,newx=x_data,s=lambda_list[[iterator]])
      mean_mmre[[i]] <- calcMMRE(testData,pred[testIndexes])
      mean_pred[[i]] <- calcPRED(testData,pred[testIndexes],percent)
    }
    overall_mean_mmre[[iterator]] <- mean(as.numeric(mean_mmre))
    overall_mean_pred[[iterator]] <- mean(as.numeric(mean_pred))
  }
  
  plot(log(lambda_list),overall_mean_mmre,xlab="log(Lambda)",ylab="MMRE")
  lines(log(lambda_list),overall_mean_mmre,xlim=range(log(lambda_list)), ylim=range(overall_mean_mmre), pch=16)
  
  plot(log(lambda_list),overall_mean_pred,xlab="log(Lambda)",ylab = "PRED")
  lines(log(lambda_list),overall_mean_pred,xlim=range(log(lambda_list)), ylim=range(overall_mean_pred), pch=16)
  
}

# Preprocess dataset
clean_lasso <- function(dataset){
  set.seed(32)
  # numeric data only
  numeric_columns <- unlist(lapply(dataset, is.numeric))
  data.numeric <- dataset[, numeric_columns]
  data.numeric <- data.frame(apply(dataset, 2, as.numeric))
  
  # remove near zero variance columns
  nzv_cols <- nearZeroVar(data.numeric)
  if(length(nzv_cols) > 0) {
    data <- data.numeric[, -nzv_cols]
  }
  
  sapply(data, function(x) sum(is.na(x)))
  
  ## Impute
  # perform mice imputation, based on random forests.
  # print(md.pattern(data))
  miceMod <- mice(data, method="rf", print=FALSE, remove_collinear = TRUE)
  # generate the completed data.
  data.imputed <- mice::complete(miceMod)
  # remove collinear columns
  coli <- findLinearCombos(data.imputed)
  data.done <- data.imputed[, -coli$remove]
  data.done$Effort <- dataset$Effort
  return(data.done)
}

#define the lasso model
m_fit.lasso <- function(lasso,dataset){
  #dataset = modelData
  #lasso = list()
  
  regressionData <- dataset[, lasso$regression_cols]
  
  #ind_variables = c("Activity_Num", "Component_Num", "Precedence_Num",	"Stimulus_Num",	"Response_Num",	"Tran_Num",	"Boundary_Num")
  cleanData <- clean_lasso(regressionData)
  #keep the columns that have been changed and set into the ind_variables
  
  #ind_variables <- setdiff(names(dataset), names(cleanData))
  #colNames <- names(cleanData)
  #for(i in 1:length(colNames)){
  #  if(!identical(dataset[, colNames[i]], cleanData[, colNames[i]])){
  #    ind_variables <- c(ind_variables, colNames[i])
  #  }
  #}
  
  ind_variables <- colnames(cleanData[, colnames(cleanData)!="Effort"])
  
  x_data <- data.matrix(cleanData[, ind_variables])
  y_data <- data.matrix(cleanData[, c("Effort")])
  
  #lasso_lm <- glmnet(x = x_data, y = y_data, alpha = 1, standardize = T)
  
  set.seed(2)
  lambda_list <- lasso_range(x_data,y_data,100)
  cvfit = cv.glmnet(x_data,y_data,
                    standardize = T, lambda = lambda_list, type.measure = 'mse', nfolds = 5, alpha = 1)
  
  lasso_lm = cvfit$glmnet.fit
  
  #print(lasso_lm$lambda)
  #plot(lasso_lm)
  #for 10 biggest final features
  #plot_glmnet(lasso_lm)                             # default colors
  #plot_glmnet(lasso_lm, label=10)
  lasso$m = lasso_lm
  lasso$m$cv_lambda = min(cvfit$cvm)
  lasso$m$cvfit = cvfit
  lasso$m$ind_variables = ind_variables
  lasso$m$lambda_list = lambda_list
  lasso
  
}

m_predict.lasso <- function(lasso, testData){
  #testData = modelData[2, ]
  #testData[,lasso$m$ind_variables]
  
  predicted <- predict(lasso$m,newx=data.matrix(testData[,lasso$m$ind_variables]),s=lasso$m$cv_lambda)
  predicted_names <- rownames(predicted)
  predicted <- as.vector(predicted[,1])
  names(predicted) <- predicted_names
  predicted
  
}

lasso_model <- function(dataset, regression_cols = c()){
  
  parameters = list(
    regression_cols = regression_cols
  )
  
}