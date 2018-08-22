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

combineData <- function(transactionFiles) {
	# Combines all the data from multiple transaction analytics files into one
	# data frame.
	#
	# Args:
	#   folder: folder containing all the files
	#
	# Returns:
	#   A data frame containing all the data in all the files.
	data <- NULL
	for(i in 1: nrow(transactionFiles)) {
	  filepath <- transactionFiles[i,]
		  if (is.null(data)) {
			  data <- subset(read.csv(filepath), select = c("TL", "TD", "DETs"))
		  }
		  else {
			  new <- subset(read.csv(filepath), select = c("TL", "TD", "DETs"))
			  data <- rbind(data, new)
		  }
	}
	
	data <- data.frame(apply(data, 2, function(x) as.numeric(x)))
	data <- na.omit(data)
	#data <- data[!is.na(data$TL), ]
	#data <- data[!is.na(data$TD), ]
	#data <- data[!is.na(data$DETs), ]
	data
}

discretize <- function(data, n) {
	# Discretizes continuous data into different levels of complexity based on
	# quantiles of normal distribution defined by the data.
	#
	# Args: 
	#   data: vector of data to discretize
	#   n: number of bins to discretize into
	#
	# Returns:
	#   A vector of cut points
	if (n <= 1) {
		return(c(-Inf, Inf))
	}
	quantiles <- seq(1/n, 1 - (1/n), 1/n)
	cutPoints <- qnorm(quantiles, mean(data), sd(data), lower.tail = TRUE)
	cutPoints <- c(-Inf, cutPoints, Inf)
}

classify <- function(data, cutPoints) {
  # Classify data into different levels of complexity based on
  # the quantile the data falls in.
  #
  # Args:
  #   data: A dataframe of transactions to classfiy.
  #   cutPoints: Matrix where each row is a vector of cut points. Each row
  #     should be named according to the parameter they cut.
  #
  # Returns:
  #   A vector that indicates how many data points fall into each bin.
  #
  # TODO: Develop a classification scheme for SWTIII (3 variables)
  numVariables <- nrow(cutPoints)
  numBins <- ncol(cutPoints) - 1
  if(numVariables == 0){
    result = c(0)
    names(result) <- c("l1")
    result["l1"] = nrow(data)
    return(result)
  }
  else if (numVariables == 1) {
    dataVec <- data[, rownames(cutPoints)]
    classifications <- cut(dataVec, breaks = cutPoints[1, ], labels = FALSE)
    #print(classifications)
    result <- rep(0, numBins)
    names(result) <- genColNames(rownames(cutPoints), numBins)
    for (i in 1:numBins) {
      result[paste("l", i, sep = "")] <- sum(classifications == i)
    }
    return(result)
  }
  else if (numVariables == 2) {
    totalClassifications <- numBins + (numBins - 1)
    result <- rep(0, totalClassifications)
    names(result) <- genColNames(rownames(cutPoints), numBins)
    for (i in 1:nrow(data)) {
      classifications <- c()
      for (p in rownames(cutPoints)) {
        parameterResult <- cut(data[i, p], breaks = cutPoints[p, ], labels = FALSE)
        classifications <- c(classifications, parameterResult)
      }
      combinedClass <- paste("l", classifications[1] + (classifications[2] - 1), sep = "")
      result[combinedClass] <- result[combinedClass] + 1
    }
    return(result)
  }
  else {
    totalClassifications <- numBins + (numBins - 1) + (numBins - 1)
    result <- rep(0, totalClassifications)
    names(result) <- genColNames(rownames(cutPoints), numBins)
    for (i in 1:nrow(data)) {
      classifications <- c()
      for (p in rownames(cutPoints)) {
        parameterResult <- cut(data[i, p], breaks = cutPoints[p, ], labels = FALSE)
        classifications <- c(classifications, parameterResult)
      }
      combinedClass <- paste("l", classifications[1] + (classifications[2] - 1) + (classifications[3] - 1), sep = "")
      result[combinedClass] <- result[combinedClass] + 1
    }
    return(result)
  }
}

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
  print(value)
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
		model <- bayesfit(lm(Effort ~ . - 1, data = trainData), 1000)
		predicted <- predict.blm(model, newdata = testData)
		foldMSE[i] <- mean((predicted - testData$Effort)^2)
		foldMMRE[i] <- calcMMRE(testData$Effort, predicted)
		foldPRED[i] <- calcPRED(testData$Effort, predicted, 25)
	}
	results <- c("MSE" = mean(foldMSE), "MMRE" = mean(foldMMRE), "PRED" = mean(foldPRED))
}

genColNames <- function(parameters, nBins) {
  # Helper function that generates a vector strings representing all possible
  # classifications.
  #
  # Args:
  #   parameters: vector of parameters being analyzed
  #   nBins: number of bins being analyzed
  #
  # Returns:
  #   A vector of strings for all possible classifications.
  if(length(parameters) == 0){
    return(paste("l", 1, sep=""))
  }
  else if (length(parameters) == 1) {
    return(paste("l", 1:nBins, sep = ""))
  }
  else if (length(parameters) == 2) {
    numLevels <- nBins + (nBins - 1)
    return(paste("l", 1:numLevels, sep = ""))
  }
  else {
    numLevels <- nBins + (nBins - 1)+(nBins - 1)
    return(paste("l", 1:numLevels, sep = ""))
  }
}

genMeans <- function(n) {
  # Generates a vector of mean values to define the multivariate Guassian prior
  # for Bayesian linear regression. The means are the Fibonacci sequence.
  #
  # Args:
  #   n: number of values to generate
  #
  # Returns:
  #   A vector of the first n Fibonnaci numbers
  if (n <= 2) {
    return(c(l1 = 1, l2 = 1)[1:n])
  }
  else {
    ret <- c(1, 1)
    while (length(ret) != n) {
      nextFib <- ret[length(ret)] + ret[length(ret) - 1]
      ret <- c(ret, nextFib)
    }
    names(ret) <- paste("l", 1:n)
    return(ret)
  }
}

genVariance <- function(mu, varFactor) {
  # Generates a covariance matrix to define the multivariate Guassian prior
  # for Bayesian linear regression. The variance for each level is 
  # varFactor*(L_n - L_(n-1)).
  #
  # Args:
  #   mu: vector of the means of the Gaussian prior
  #   varFactor: used to tune the amount of variance in the prior
  #
  # Returns:
  #   Covariance matrix for the Gaussian prior
  ret <- matrix(rep(0, length(mu)^2), nrow = length(mu), ncol = length(mu))
  rownames(ret) <- names(mu)
  colnames(ret) <- names(mu)
  ret[1,1] <- varFactor
  if (length(mu) == 1) {
    return(ret)
  }
  ret[2,2] <- varFactor
  if (length(mu) == 2) {
    return(ret)
  }
  for (i in 3:length(mu)) {
    ret[i, i] <- varFactor * (mu[i] - mu[i - 1])
  }
  ret
}

calcVn <- function(sigma, variance, lmfit) {
  # Function to compute the covariance matrix of the posterior distribution of
  # Bayesian linear regression with Gaussian prior.
  #
  # Args:
  #   sigma: the variance of the residuals from OLS regression
  #   variance: the covariance matrix of the parameters (prior)
  #   lmfit: the OLS model lm object
  #
  # Returns:
  #   The covariance matrix of the posterior Gaussian distribution
  X <- model.matrix(lmfit)
  #print(X)
  V0.inv <- chol2inv(chol(variance))
  ret <- sigma * chol2inv(chol((sigma * V0.inv) + (t(X)%*%X)))
  ret
}

calcWn <- function(Vn, sigma, means, variance, lmfit) {
  # Function to compute the mean vector of the posterior distribution of
  # Bayesian linear regression with Gaussian prior.
  #
  # Args:
  #   Vn: covariance matrix of the posterior Gaussian
  #   sigma: the variance of the residuals from OLS regression
  #   means: vector of means of the parameters (prior)
  #   variance: the covariance matrix of the parameters (prior)
  #   lmfit: the OLS model lm object
  V0.inv <- chol2inv(chol(variance))
  residualVar.inv <- 1/sigma
  X <- model.matrix(lmfit)
  y <- lmfit$model$Effort
  ret <- (Vn %*% V0.inv %*% means) + (residualVar.inv * (Vn %*% t(X) %*% y))
  ret <- as.vector(ret)
  names(ret) <- names(lmfit$coef)
  ret
}


bayesfit<-function(lmfit, N) {
	# Function to compute the bayesian analog of the lmfit using Gaussian
	# priors and Monte Carlo scheme based on N samples. Adapted from:
	# https://www.r-bloggers.com/bayesian-linear-regression-analysis-without-tears-r/
	# 6/14/18.
	# The solution for the posterior distribution of Bayesian linear regression
  # with Gaussian likelihood and Gaussian prior:
  # N ~ (w | Wn, Vn)
  # Wn = Vn(V0)^-1w0 + (1/sigma^2)VnX'y
  # Vn = sigma^2(sigma^2(V0)^-1 + X'X)^-1
  #
  # Reference: Murphy, Kevin. Machine Learning: A Probabilistic Perspective. 
  # Cambridge: The MIT Press, 2012. Print. Section 7.6.1.
  #
	# Args:
	#   lmfit: a lm object created from lmfit()
	#   N: the number of data points to use for Monte Carlo method
	#
	# Returns:
	#   A dataframe containing results of the Bayes line fit.
	df.residual<-lmfit$df.residual
	s2<-(t(lmfit$residuals)%*%lmfit$residuals)
	s2<-s2[1,1]/df.residual
	means <- genMeans(lmfit$rank)
	covar <- genVariance(means, 1)
	## now to sample residual variance
	sigma<-df.residual*s2/rchisq(N,df.residual)
	coef.sim<-sapply(sigma, function(x) {
	  Vn <- calcVn(x, covar, lmfit)
	  Wn <- calcWn(Vn, x, means, covar, lmfit)
	  mvrnorm(1,Wn,Vn)
	})
	if (is.vector(coef.sim)) {
	  ret <- data.frame(coef.sim)
	}
	else {
	  ret<-data.frame(t(coef.sim))
	}
	names(ret)<-names(lmfit$coef)
	ret$sigma<-sqrt(sigma)
	ret
}

Bayes.sum<-function(x) {
	# Provides a summary for a variable of a Bayesian linear regression.
	#
	# Args:
	#   x: a column of the data frame returned by the bayesfit() function
	#
	# Returns:
	#   A vector containing the summary 
	c("mean"=mean(x),
			"se"=sd(x),
			"t"=mean(x)/sd(x),
			"median"=median(x),
			"CrI"=quantile(x,prob=0.025),
			"CrI"=quantile(x,prob=0.975)
	)
}

predict.blm <- function(model, newdata) {
	# predict.lm() analogue for Bayesian linear regression
	#
	# Args:
	#   model: a bayes linear regression model
	#   newdata: new data to perform prediction
	#
	# Returns:
	#   Vector of new predictions
	#newdata <- subset(newdata, !colnames(newdata) %in% c("Effort"))
  `%ni%` <- Negate(`%in%`)
  subset(newdata,select = colnames(newdata) %ni% c("Effort"))
	ret <- apply(newdata, 1, function(x) {
				effort <- 0
				for (col in colnames(newdata)) {
					effort <- effort + (mean(model[, col]) * x[col])
				}
				effort
			})
	ret
}

performSearch <- function(n, effortData, transactionFiles, parameters = c("TL", "TD", "DETs"), k = 5) {
  # Performs search for the optimal number of bins and weights to apply to each
  # bin through linear regression.
  #
  # Args:
  #   n: Specifies up to how many bins per parameter to search.
  #   folder: Folder containg all the transaction analytics data to analyze.
  #   effortData: a data frame containing effort data corresponding to each of
  #               the files contained in the folder argument. Rows must be named
  #               the same as the filename and effort column should be named "Effort".
  #   parameters: A vector of which parameters to analyze. Ex. "TL", "TD", "DETs". When the parameters is an empty array, just apply linear regression on number of transactions.
  #   k: How many folds to use for k-fold cross validation.
  #
  # Returns:
  #   A list in which the ith index gives the results of the search for i bins.
  
  projects <- rownames(effortData)
  combinedData <- combineData(transactionFiles)
  paramAvg <- if (length(parameters) == 1) mean(combinedData[, parameters]) else colMeans(combinedData[, parameters])
  paramSD <- if (length(parameters) == 1) sd(combinedData[, parameters]) else apply(combinedData[, parameters], 2, sd)
  if(length(parameters) == 0){
    n = 1
  }
  searchResults <- list()
  for (i in seq(1,n)) {
    cutPoints <- matrix(NA, nrow = length(parameters), ncol = i + 1)
    rownames(cutPoints) <- parameters
    for (p in parameters) {
      cutPoints[p, ] <- discretize(combinedData[, p], i)
    }
    #numFiles <- sum(grepl(".csv", dir(folder), ignore.case = TRUE))
    levels <- genColNames(parameters, i)
    regressionData <- matrix(nrow = length(projects), ncol = length(levels) + 1)
    rownames(regressionData) <- projects
    colnames(regressionData) <- c(levels, "Effort")
    for (project in projects) {
        filePath <- transactionFiles[project, "transaction_file"]
        if (!file.exists(filePath)) {
          print("file doesn't exist")
          next
        }
        fileData <- read.csv(filePath)
        fileData <- data.frame(apply(subset(fileData, select = c("TL", "TD", "DETs")), 2, function(x) as.numeric(x)))
        fileData <- na.omit(fileData)
        
        if(nrow(fileData) < 1){
          next
        }
        classifiedData <- classify(fileData, cutPoints)
        regressionData[project, ] <- c(classifiedData, effortData[project, "Effort"])
    }
    regressionData <- na.omit(regressionData)
    regressionData <- rbind(regressionData, "Aggregate" = colSums(regressionData))
    regressionData <- as.data.frame(regressionData)
    validationResults <- crossValidate(regressionData[rownames(regressionData) != "Aggregate", ], k)
    #print("cross validation")
    searchResults[[i]] <- list(MSE = validationResults["MSE"], 
                               MMRE = validationResults["MMRE"], 
                               PRED = validationResults["PRED"],
                               model = bayesfit(lm(Effort ~ . - 1, regressionData[rownames(regressionData) != "Aggregate", ]), 1000),
                               data = regressionData,
                               cuts = cutPoints)
  }
  searchResults
}

#effort <- read.csv("modelEvaluations_8_12.csv")
#rownames(effort) <- effort$Project
#SWTIresults <- performSearch(3, effort, c("TL"))

estimateEffortWithTrainedModel <- function(data, trainedModel){
  #data = fileData
  #trainedModel = trainedModels[["TNModel"]]
  #trainedModelParameters <- readRDS(file="train_model_parameters.rds")
  data <- subset(data, select = c("TL", "TD", "DETs"))
  data <- data.frame(apply(data, 2, function(x) as.numeric(x)))
  data <- na.omit(data)
  
  if(nrow(data) < 1){
    return(-1)
  }
  classifiedData <- classify(data, trainedModel$cuts)
  levels <- names(classifiedData)
  classifiedData <- matrix(classifiedData, nrow=1, ncol=length(classifiedData))
  colnames(classifiedData) <- levels
  predicted <- predict.blm(trainedModel$model, newdata = classifiedData)
  predicted
}

