# This script performs search for the optimal model in predicting effort from
# software size. The measure of software size used is the sum of weighted
# transactions calculated in the following manner:
# 1. Discretize the transaction data based on quantiles of a normal distribution
#    obtained from aggregate data.
# 2. Classify each transaction based on the quantiles it falls in.
# 3. Count the number of points that fall into each quantile and apply weights.
# 4. Sum all the weights.
# This script determines the optimal number of bins and the weights to apply
# using Bayesian linear regression and k-fold cross validation.
#
# Usage:
#   1. Put all the transaction analytics files into a folder.
#   2. Construct a data frame with the effort values.
#   3. Call performSearch() with desired arguments.
#   4. Examine the object returned by performSearch().
#       Ex. results <- performSearch(4, "./Transaction Data", effort)
#       a. Return the mean MSE result for i bins: results[[i]]$MSE
#       b. Return the mean MMRE result for i bins: results[[i]]$MMRE
#       c. Return the mean PRED(0.25) result for i bins: results[[i]]$PRED
#       d. Return the cut point results for i bins: results[[i]]$cuts
#       e. Return the weights results for i bins: results[[i]]$model
#       f. Return the discretization/classification data for i bins: results[[i]]$data

library(ggplot2)
library(MASS)


calcMMRE <- function(testData, pred) {
  # Calculates mean magnitude relative error (MMRE).
  #
  # Args:
  #   testData: known results to validate against
  #   pred: predicted results from the model
  #
  # Returns:
  #   MMRE
  mmre <- abs(testData - pred)/testData
  mean_value <- mean(mmre)
  mean_value
}

calcPRED <- function(testData, pred, percent) {
  # Calculates percentage relative error deviation (PRED).
  #
  # Args:
  #   testData: known results to validate against
  #   pred: predicted results from the model
  #   percent: percent error threshold to accept predicted value
  #
  # Returns:
  #   PRED
  value <- abs(testData - pred)/testData
  percent_value <- percent/100
  pred_value <- value <= percent_value
  mean(pred_value)
}

crossValidate <- function(data, k) {
	# Performs k-fold cross validation with Bayesian linear regression as training 
  # method.
	#
	# Args:
	#   data: the data to perform cross-validation with
	#   k: number of folds to use
	#
	# Returns:
	#   A vector of mean MSE, MMRE, PRED(0.25) for all folds.
	folds <- cut(seq(1, nrow(data)), breaks = k, labels = FALSE)
	foldMSE <- vector(length = k)
	foldMMRE <- vector(length = k)
	foldPRED <- vector(length = k)
	for (i in 1:k) {
		testIndexes <- which(folds == i, arr.ind = TRUE)
		testData <- data[testIndexes, ]
		trainData <- data[-testIndexes, ]
		model <- lm(Effort ~ . - 1, data = trainData)
		predicted <- predict.lm(model, newdata = testData)
		foldMSE[i] <- mean((predicted - testData$Effort)^2)
		foldMMRE[i] <- calcMMRE(testData$Effort, predicted)
		foldPRED[i] <- calcPRED(testData$Effort, predicted, 25)
	}
	results <- c("MSE" = mean(foldMSE), "MMRE" = mean(foldMMRE), "PRED" = mean(foldPRED))
}

predict.lm <- function(model, newdata) {
  # predict.lm() analogue for Bayesian linear regression
  #
  # Args:
  #   model: a bayes linear regression model
  #   newdata: new data to perform prediction
  #
  # Returns:
  #   Vector of new predictions
  newdata <- subset(newdata, select = -c(Effort))
  ret <- apply(newdata, 1, function(x) {
    effort <- 0
    effort <- t(coef(model))%*%x
    effort
  })
  ret
}

performSearch <- function(folder, effortData, parameters = c("TL", "TD", "DETs"), k = 5) {
  # Performs search for the optimal number of bins and weights to apply to each
  # bin through linear regression.
  #
  # Args:
  #   n: Specifies up to how many bins per parameter to search.
  #   folder: Folder containg all the transaction analytics data to analyze.
  #   effortData: a data frame containing effort data corresponding to each of
  #               the files contained in the folder argument. Rows must be named
  #               the same as the filename and effort column should be named "Effort".
  #   parameters: A vector of which parameters to analyze. Ex. "TL", "TD", "DETs"
  #   k: How many folds to use for k-fold cross validation.
  #
  # Returns:
  #   A list in which the ith index gives the results of the search for i bins.
  #combinedData <- combineData(folder)
    #numFiles <- sum(grepl(".csv", dir(folder), ignore.case = TRUE))
    regressionData <- matrix(nrow = nrow(effortData), ncol = length(parameters) + 1)
    rownames(regressionData) <- effortData$Project
    colnames(regressionData) <- c(parameters, "Effort")
    #for (file in dir(folder)) {
    #  if (grepl(".csv", file, ignore.case = TRUE)) {
    #    fileData <- read.csv(paste(folder, file, sep = "/"))
    #    fileData <- na.omit(fileData)
    #    regressionData[file, ] <- c(colSums(subset(fileData, select=parameters)), effortData[file, "Effort"])
    #  }
    #}
    for(i in 1:nrow(effortData)){
      project <- effortData[i, ]$Project
      csvFile <- paste(folder, paste(project, "csv", sep="."), sep="/")
      if (file.exists(csvFile)) {
      transactionData <- subset(read.csv(csvFile), select=parameters)
      for(j in 1:ncol(transactionData)){
        transactionData[,j] = as.numeric(transactionData[, j])
      }
      transactionData <- na.omit(transactionData)
      print(transactionData)
      regressionData[project,] <- c(colSums(transactionData), effortData[i, "Effort"])
      }
    }
    
    regressionData <- na.omit(regressionData)
    
    #print(regressionData)
    
    regressionData <- as.data.frame(regressionData)
    validationResults <- crossValidate(regressionData, k)
    searchResults <- list(MSE = validationResults["MSE"],
                              MMRE = validationResults["MMRE"], 
                               PRED = validationResults["PRED"],
                               model = lm(Effort ~ . - 1, regressionData),
                               data = regressionData)
    searchResults
}



