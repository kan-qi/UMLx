# This script performs search for the optimal model in predicting effort from
# software size. The measure of software size used is the sum of weighted
# transactions calculated in the following manner:
# 1. Discretize the transaction data based on quantiles of a normal distribution
#    obtained from aggregate data.
# 2. Classify each transaction based on the quantile it falls in.
# 3. Count the number of points that fall into each quantile and apply weights.
# 4. Sum all the weights.
# This script determines the optimal number of bins and the weights to apply
# using linear regression and k-fold cross validation.
#
# Usage:
#   1. Put all the transaction analytics files into a folder.
#   2. Construct a data frame with the effort values.
#   3. Call performSearch() with desired arguments.
#   4. Examine the object returned by performSearch().
#       Ex. results <- performSearch(4, "./Transaction Data", effort)
#       a. Return the mean MSE result for i bins: results[[i]]$MSE
#       b. Return the weights results for i bins: results[[i]]$model
#       c. Return the discretization/classification data for i bins: results[[i]]$data

library(ggplot2)
library(MASS)

combineData <- function(folder) {
	# Combines all the data from multiple transaction analytics files into one
	# data frame.
	#
	# Args:
	#   folder: folder containing all the files
	#
	# Returns:
	#   A data frame containing all the data in all the files.
	data <- NULL
	for (file in dir(folder)) {
		filepath <- paste(folder, file, sep="/")
		if (is.null(data)) {
			data <- read.csv(filepath)[, -c(1)]
		}
		else {
			new <- read.csv(filepath)[, -c(1)]
			data <- rbind(data, new)
		}
	}
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
	numVariables <- nrow(cutPoints)
	numBins <- length(cutPoints[1, ]) - 1
	totalClassifications <- numBins^numVariables
	result <- rep(0, totalClassifications)
	names(result) <- genColNames(rownames(cutPoints), numBins)
	for (i in 1:nrow(data)) {
		classifications <- c()
		for (p in rownames(cutPoints)) {
			parameterResult <- cut(data[i, p], breaks = cutPoints[p, ], labels = FALSE)
			classifications <- c(classifications, paste(p, parameterResult, sep = ""))
		}
		combinedClass <- paste(classifications, sep = "", collapse = "")
		result[combinedClass] <- result[combinedClass] + 1
	}
	result
}

crossValidate <- function(data, k) {
	# Performs k-fold cross validation with linear regression as training method.
	#
	# Args:
	#   data: the data to perform cross-validation with
	#   k: number of folds to use
	#
	# Returns:
	#   The mean MSE for all folds.
	folds <- cut(seq(1, nrow(data)), breaks = k, labels = FALSE)
	foldMSE <- vector(length = k)
	for (i in 1:k) {
		testIndexes <- which(folds == i, arr.ind = TRUE)
		testData <- data[testIndexes, ]
		trainData <- data[-testIndexes, ]
		model <- bayesfit(lm(Effort ~ ., data = trainData), 10000)
		predicted <- predict.blm(model, newdata = testData)
		foldMSE[i] <- mean((predicted - testData$Effort)^2)
	}
	mean(foldMSE)
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
	if (length(parameters) == 1) {
		return(paste(parameters[1], 1:nBins, sep = ""))
	}
	else if (length(parameters) == 2) {
		first <- paste(parameters[1], 1:nBins, sep = "")
		second <- paste(parameters[2], 1:nBins, sep = "")
		return (as.vector(sapply(first, paste, second, sep = "")))
	}
	else {
		first <- paste(parameters[1], 1:nBins, sep = "")
		second <- paste(parameters[2], 1:nBins, sep = "")
		third <- paste(parameters[3], 1:nBins, sep = "")
		result <- sapply(sapply(first, paste, second, sep = ""), paste, third, sep = "")
		return(as.vector(result))
	}
}

bayesfit<-function(lmfit, N) {
	# Function to compute the bayesian analog of the lmfit using non-informative 
	# priors and Monte Carlo scheme based on N samples. Taken from:
	# https://www.r-bloggers.com/bayesian-linear-regression-analysis-without-tears-r/
	# 6/14/18.
	#
	# Args:
	#   lmfit: a lm object created from lmfit()
	#   N: the number of data points to use for Monte Carlo method
	#
	# Returns:
	#   A dataframe containing results of the Bayes line fit.
	QR<-lmfit$qr
	df.residual<-lmfit$df.residual
	R<-qr.R(QR) ## R component
	coef<-lmfit$coef
	Vb<-chol2inv(R) ## variance(unscaled)
	s2<-(t(lmfit$residuals)%*%lmfit$residuals)
	s2<-s2[1,1]/df.residual
	
	## now to sample residual variance
	sigma<-df.residual*s2/rchisq(N,df.residual)
	coef.sim<-sapply(sigma,function(x) mvrnorm(1,coef,Vb*x))
	ret<-data.frame(t(coef.sim))
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
	newdata <- subset(newdata, select = -c(Effort))
	ret <- apply(newdata, 1, function(x) {
				effort <- 0
				for (col in colnames(newdata)) {
					effort <- effort + (mean(model[, col]) * x[col])
				}
				effort <- effort + mean(model[, "(Intercept)"])
			})
	ret
}

performSearch <- function(n, folder, effortData, parameters = c("TL", "TD", "DETs"), k = 5) {
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
	combinedData <- combineData(folder)
	paramAvg <- if (length(parameters) == 1) mean(combinedData[, parameters]) else colMeans(combinedData[, parameters])
	paramSD <- if (length(parameters) == 1) sd(combinedData[, parameters]) else apply(combinedData[, parameters], 2, sd)
	searchResults <- list()
	for (i in seq(1,n)) {
		cutPoints <- matrix(NA, nrow = length(parameters), ncol = i + 1)
		rownames(cutPoints) <- parameters
		for (p in parameters) {
			cutPoints[p, ] <- discretize(combinedData[, p], i)
		}
		regressionData <- matrix(nrow = length(dir(folder)), ncol = i^length(parameters) + 1)
		rownames(regressionData) <- c(dir(folder))
		colnames(regressionData) <- c(genColNames(parameters, i), "Effort")
		for (file in dir(folder)) {
			fileData <- read.csv(paste(folder, file, sep = "/"))
			regressionData[file, ] <- c(classify(fileData, cutPoints), effortData[file, "Effort"])
		}
		regressionData <- rbind(regressionData, "Aggregate" = colSums(regressionData))
		regressionData <- as.data.frame(regressionData)
		searchResults[[i]] <- list(MSE = crossValidate(regressionData[rownames(regressionData) != "Aggregate", ], k), 
				model = bayesfit(lm(Effort ~ ., regressionData[rownames(regressionData) != "Aggregate", ]), 10000),
				data = regressionData)
	}
	searchResults
}