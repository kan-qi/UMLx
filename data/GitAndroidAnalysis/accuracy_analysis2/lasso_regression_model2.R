library(glmnet)
library(plotmo) # for plot_glmnet

Lasso_range = function(x, y, k){
  # inputs:
      # x_matrix, a matrix containing independent variables
      # y: vector of dependent varaibles
      # k: the length of sequence
  # output:
      # seq: a sequence of lambdaa from high to low
  x = x_data
  y = y_data
  k = 100
  
  
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


#Lasso_range(x_data,y_data, 100)

cv_lasso_model = function(x_data,y_data){
set.seed(2)
lambda_list <- Lasso_range(x_data,y_data,100)
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

#define the lasso model
m_fit.lasso <- function(lasso,dataset){
  
  ind_variables = c("Activity_Num", "Component_Num", "Precedence_Num",	"Stimulus_Num",	"Response_Num",	"Tran_Num",	"Boundary_Num")
  x_data <- data.matrix(dataset[ind_variables])
  y_data <- data.matrix(dataset[c("Effort")])
  
  
  lasso_lm <- glmnet(x = x_data, y = y_data, alpha = 1, standardize = T)
  print(lasso_lm$lambda)
  plot(lasso_lm)
  #for 10 biggest final features
  plot_glmnet(lasso_lm)                             # default colors
  #plot_glmnet(lasso_lm, label=10)
  lasso$m = lasso_lm
  lasso
  
}

m_predict.lasso <- function(lasso, testData){
  pred <- predict(lasso$m,newx=testData,s=lasso$lambda)
}

lasso_model <- function(dataset){
  
  parameters = list()
  
}