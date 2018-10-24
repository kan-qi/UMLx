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
library(mvtnorm)
library(invgamma)

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


prodByLinearRegression <- function(effortData, transactionFiles, cutPoints, weights){
    #effortData <- effort
    #transactionFiles <- transactionsFiles
    #cutPoints <- cutpoints
    #weights <- weights
    
    projects <- rownames(effortData)
  
    regressionData <- matrix(nrow = length(projects), ncol = 2)
    rownames(regressionData) <- projects
    colnames(regressionData) <- c("size", "Effort")
    numOfTrans <- 0
    for (project in projects) {
      #project <- projects[1]
      filePath <- transactionFiles[project, "transaction_file"]
      print(filePath)
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
      numOfTrans = numOfTrans + nrow(fileData)
      
      if(is.null(cutPoints)){
      size = nrow(fileData)
      }
      else{
      classifiedData <- classify(fileData, cutPoints)
      size <- classifiedData %*% weights 
      }
      
      regressionData[project, ] <- c(size, effortData[project, "Effort"])
    }
    
    print(numOfTrans)
    
    regressionData <- na.omit(regressionData)
    #regressionData <- rbind(regressionData, "Aggregate" = colSums(regressionData))
    regressionData <- as.data.frame(regressionData)
    
    print("regressionData")
    print(regressionData)
  #}
    
    lm.fit <- lm(Effort ~ .-1, regressionData)
    coefficients <- summary(lm.fit)$coefficients
    predicts <- as.data.frame(predict(lm.fit, newData = regressionData))
    rownames(predicts) <- projects
    results = list()
    results[["predicts"]] <- predicts
    results[["coefficients"]] <- coefficients
    results
}

parametricKStest <- function(dist){
  dist <- combined[, "DETs"]
  #dist <- combined[, "TL"]
  
  #tableValues <- table(dist)
  
  #reduce sizes for fitting with gamma curve
  #print(as.integer(tableValues/10))
  
  #dist <- rep(as.numeric(names(tableValues)), as.integer(tableValues/10))
  dist <- rep(as.numeric(names(tableValues)), as.integer(tableValues/100))
  
  fit.gamma <- fitdist(dist, distr = "gamma", method = "mle", lower = c(0, 0))
  fit.weibull <- fitdist(dist, "weibull")
  
  plot(fit.weibull)
  plot(fit.gamma)
  
  # Check result
  shape = coefficients(fit.gamma)["shape"]
  rate = coefficients(fit.gamma)["rate"]
  
  print(coefficients(fit.gamma))
  
  # testing the goodness of fit.
  #num_of_samples = length(dist)
  #y <- rgamma(num_of_samples, shape = shape, rate = rate)
  #result = ks.test(dist, y)
  
  ksResult <- ks.test(dist, "pgamma", shape, rate)
  
  print("gamma goodness of fit")
  print(ksResult)
  ks = ksResult[['statistic']]
  
  # iterate 10000 samples for ks-statistics
  num_of_samples = length(dist)
  sample_ks <- c()
  runs = 10000
  for(i in 1: runs){
    run.Sample <- rgamma(num_of_samples, shape = shape, rate = rate)
    
    run.fit.gamma <- fitdist(run.Sample, distr = "gamma", method = "mle", lower = c(0, 0))
    # Check result
    run.shape = coefficients(run.fit.gamma)["shape"]
    run.rate = coefficients(run.fit.gamma)["rate"]
    
    result = ks.test(run.Sample, "pgamma", run.shape, run.rate) 
    
    #result = ks.test(dist, y)
    #print("gamma goodness of fit")
    #print(result)
    sample_ks = c(sample_ks, result[['statistic']])
  }
  
  tests<-sapply(sample_ks, function(x) {
    if(x > ks ){
      1
    }
    else {
      0
    }
  })
  
  print(sample_ks)
  #print(tests)
  
  parametric_test = sum(tests)/runs
  
  print("parametric test")
  print(parametric_test)
  
  parametric_test

}

chisqTest <- function(dist){
  dist <- combined[, "TD"]
  x.gam.cut<-cut(dist,breaks=c(0,3,6,9,12,Inf)) ##binning data
  table(x.gam.cut) ## binned data table
  
  fit.gamma <- fitdist(dist, distr = "gamma", method = "qme", lower = c(0, 0))
  # Check result
  a.est = coefficients(fit.gamma)["shape"]
  l.est = coefficients(fit.gamma)["rate"]
  
  num_of_samples = length(dist)
  
  #x.gam.cut
  ## computing expected frequencies
  p1 = (pgamma(3,shape=a.est,rate=l.est)-pgamma(0,shape=a.est,rate=l.est))*num_of_samples
  p2 = (pgamma(6,shape=a.est,rate=l.est)-pgamma(3,shape=a.est,rate=l.est))*num_of_samples
  p3 = (pgamma(9,shape=a.est,rate=l.est)-pgamma(6,shape=a.est,rate=l.est))*num_of_samples
  p4 = (pgamma(12,shape=a.est,rate=l.est)-pgamma(9,shape=a.est,rate=l.est))*num_of_samples
  p5 = (pgamma(Inf,shape=a.est,rate=l.est)-pgamma(12,shape=a.est,rate=l.est))*num_of_samples
  f.ex<-c(p1, p2, p3, p4, p5) ## expected frequencies vector
  f.os<-vector()
  for(i in 1:5) f.os[i]<- table(x.gam.cut)[[i]] ## empirical frequencies
  X2<-sum(((f.os-f.ex)^2)/f.ex) ## chi-square statistic
  gdl<-5-2-1 ## degrees of freedom
  1-pchisq(X2,gdl) ## p-value
}

chisqTest <- function(dist){
  dist <- combined[, "TD"]
  
  dist <- rep(as.numeric(names(tableValues)), as.integer(tableValues/100))
  
  x.gam.cut<-cut(dist,breaks=c(0,3,6,9,12,Inf)) ##binning data
  table(x.gam.cut) ## binned data table
  
  fit.gamma <- fitdist(dist, distr = "gamma", method = "qme", lower = c(0, 0))
  # Check result
  a.est = coefficients(fit.gamma)["shape"]
  l.est = coefficients(fit.gamma)["rate"]
  
  num_of_samples = length(dist)
  
  #x.gam.cut
  ## computing expected frequencies
  p1 = (pgamma(3,shape=a.est,rate=l.est)-pgamma(0,shape=a.est,rate=l.est))*num_of_samples
  p2 = (pgamma(6,shape=a.est,rate=l.est)-pgamma(3,shape=a.est,rate=l.est))*num_of_samples
  p3 = (pgamma(9,shape=a.est,rate=l.est)-pgamma(6,shape=a.est,rate=l.est))*num_of_samples
  p4 = (pgamma(12,shape=a.est,rate=l.est)-pgamma(9,shape=a.est,rate=l.est))*num_of_samples
  p5 = (pgamma(Inf,shape=a.est,rate=l.est)-pgamma(12,shape=a.est,rate=l.est))*num_of_samples
  f.ex<-c(p1, p2, p3, p4, p5) ## expected frequencies vector
  f.os<-vector()
  for(i in 1:5) f.os[i]<- table(x.gam.cut)[[i]] ## empirical frequencies
  X2<-sum(((f.os-f.ex)^2)/f.ex) ## chi-square statistic
  gdl<-5-2-1 ## degrees of freedom
  1-pchisq(X2,gdl) ## p-value
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
  
  #n = 6
  #data = combined[, "TD"]
  
  #print(data)
  
	if (n <= 1) {
		return(c(-Inf, Inf))
	}
  
  quantiles <- seq(1/n, 1 - (1/n), 1/n)
	
	fit.gamma <- fitdist(vec, distr = "gamma", method = "mle", lower = c(0, 0))
	# Check result
	shape = coefficients(fit.gamma)["shape"]
	rate = coefficients(fit.gamma)["rate"]
	print(coefficients(fit.gamma))
	
	cutPoints <- qgamma(quantiles, shape, rate, lower.tail = TRUE)
	cutPoints <- c(-Inf, cutPoints, Inf)
	#print(cutPoints)
	
	#par(mar = rep(2, 4))
	#plot(fit.gamma)
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
    #print(cutPoints[1, ])
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
  #print(value)
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
  
  #data <- regressionData
  #k <- 5
  
	folds <- cut(seq(1, nrow(data)), breaks = k, labels = FALSE)
	foldMSE <- vector(length = k)
	foldMMRE <- vector(length = k)
	foldPRED <- vector(length = k)
	for (i in 1:k) {
		testIndexes <- which(folds == i, arr.ind = TRUE)
		testData <- data[testIndexes, ]
		trainData <- data[-testIndexes, ]
		# Normalize effort data
		#trainData$Effort = trainData$Effort
		levels = length(trainData) - 1
		normFactor <- calNormFactor(trainData, levels)
		#print(normFactor)
		
		#normalizedData <- regressionData[rownames(regressionData) != "Aggregate", ]
		#normalizedData$Effort <- normalizedData$Effort/normFactor
		#bayesianModel <- bayesfit(lm(Effort ~ . - 1, normalizedData), 1000)
		
		means <- genMeans(levels)
		#print(means)
		covar <- genVariance(means, 1)
		bayesianModel <- bayesfit3(trainData, 10000, means, covar, normFactor["mean"], normFactor['var'])
		predicted <- predict.blm(bayesianModel, newdata = testData)
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
    return(c(l1 = 1, l2 = 2)[1:n])
  }
  else {
    ret <- c(1, 1)
    while (length(ret) != n) {
      nextFib <- ret[length(ret)] + ret[length(ret) - 1]
      ret <- c(ret, nextFib)
    }
    names(ret) <- paste("l", 1:n, sep="")
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
    ret[i, i] <- (varFactor * (mu[i] - mu[i - 1]))^2
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


######## likelihood function ################
likelihood <- function(B, normFactor, sd, x, y){
  #x = regressionData[ , !(names(regressionData) %in% c("Effort"))]
  #y = regressionData[,c("Effort")]
  #B = means
  #print(as.matrix(x))
  #print(t(as.matrix(B)))
  #print(x)
  
  #print(B)
  #print(x)
  pred = normFactor*(as.matrix(x)%*%as.matrix(B))
  
  singlelikelihoods = dnorm(y, pred, sd, log = T)
  sumll = sum(singlelikelihoods)
  #print("sumll")
  #print(sumll)
  return(sumll)   
}

######## prior function ################
prior <- function(sample, B, varianceMatrix, normFactor, var){
  
  prior <- rep(0, 3)
  names(prior) <- c("normFactor", "priorB", "sd")
  #prior['normFactor'] = dnorm(sample["normFactor"], normFactor, sd=sqrt(var), log=T)
  prior['normFactor'] = dunif(sample["normFactor"], min=0, max=15, log = T)
  #print("norm factor prior prob")
  #print(prior['normFactor'])
  
  #B = c(1, 3)
  #names(B) = c("l1", "l2")
  #sample = c(5, 6)
  #names(sample) = names(B)
  #varianceMatrix <- matrix(rep(0, length(B)^2), nrow = length(B), ncol = length(B))
  #varianceMatrix[1, 1] = 0.5
  #varianceMatrix[2, 2] = 0.8
  prior["priorB"] <- dmvnorm(sample[names(B)], B, varianceMatrix, log=T)
  #print("b prior prob")
  #print(prior[names(B)])
  #prior['sd'] <- dinvgamma(sample["sd"], 0.1, 0.1, log=T)
  #prior['sd'] <- dunif(sample["sd"], min=0, max=30, log = T)
  #Jeffrey's prior
  prior['sd'] <- log(1/sample['sd'])
  
  jointPrior <- (prior['normFactor']+prior['priorB']+prior['sd'])
  names(jointPrior) <- NULL
  
  #print("join prior")
  #print(sample)
  #print(prior)
  
  return(jointPrior)
}

######## posterior function ################
posterior <- function(sample, B, varianceMatrix, normFactor, var, x, y){
  #print("hello2")
  return (likelihood(sample[names(B)], sample['normFactor'], sample['sd'], x, y) + prior(sample, B, varianceMatrix, normFactor, var))
}

######## Metropolis algorithm ################

proposalfunction <- function(B, normFactor, sd){
  #sd <- 10
  sample <- rep(0, length(B)+2)
  names(sample) <- c(names(B), "normFactor", "sd")
  
  sigma <- c(0.1)
  if(length(B)>1){
  for (i in 1:length(B)) {
    sigma <- c(sigma, 1/5* (abs(B[i] - B[i - 1]))+0.1)
  }
  }
  #print(sigma)
  #sigma <- rep(0.1, length(B))
  sample[names(B)] <- rnorm(length(B),mean = B, sd = sigma)
  sample["normFactor"] <- rnorm(1, normFactor, 0.1)
  sample['sd'] <- rnorm(1, sd, 3)
  sample['sigma'] <- sigma
  return(sample)
}

proposalProbability <- function(x1, x2){
  #
  # return the proposal probability g(x1|x2)
  #
  
  probB <- sum(dnorm(x1["B"],mean = x2["B"], sd = x2["sigma"], log = T))
  probNormFactor <- dnorm(x1["normFactor"], x2["normFactor"], 0.1, log=T)
  probSD <- dnorm(x1["sd"], x2["sd"], log=T)
  return(probB+probNormFactor+probSD)
  
}

run_metropolis_MCMC <- function(regressionData, N, priorB, varianceMatrix, normFactor, var){
  #priorB <- B
  #normFactor <- normFactor1
  #if(normFactor < 1){
  #  normFactor = 1
  #}
  chain = matrix(nrow=N+1, ncol=length(priorB)+2)
  colnames(chain) <- c(names(priorB), "normFactor", "sd", "sigma")
  chain[1, "normFactor"] <- normFactor
  chain[1, names(priorB)] <- priorB
  chain[1, "sd"] <- 10
  
  sigma <- c(0.1)
  if(length(priorB)>1){
    for (i in 1:length(priorB)) {
      sigma <- c(sigma, 1/5* (abs(priorB[i] - priorB[i - 1]))+0.1)
    }
  }
  chain[1, "signma"] = sigma
  #probabs <- c()
  #acceptance <- c()
  for (i in 1:N){
    proposal = proposalfunction(chain[i,names(priorB)], chain[i,"normFactor"], chain[i, "sd"])
    #proposal = sample
    `%ni%` <- Negate(`%in%`)
    update <- posterior(proposal, priorB, varianceMatrix, normFactor, var, regressionData[ , !(colnames(regressionData) %in% c("Effort"))], regressionData[,c("Effort")])
    posterior <- posterior(chain[i,], priorB, varianceMatrix, normFactor, var, regressionData[ , !(colnames(regressionData) %in% c("Effort"))], regressionData[,c("Effort")])
    probab = min(c(1, exp(update + proposalProbability(chain[i,], proposal) - posterior - proposalProbability(proposal, chaine[i, ]))))
    #probabs = c(probabs, probab)
    #print(probab)
    #the better way of calculating the acceptance rate
    
    
    if (runif(1) < probab){
      chain[i+1,] = proposal
      #print("accept")
      #acceptance = c(acceptance, "accept")
    }else{
      chain[i+1,] = chain[i,]
      #print("not accept")
      #acceptance = c(acceptance, "not accept")
    }
  }
  
  return(chain)
}

bayesfit3<-function(regressionData, N, B, varianceMatrix, normFactor, var){
  #N <-1000
  #B <- means
  #varianceMatrix <- covar
  #normFactor1 <- normFactor['mean']
  #var <- normFactor['se']^2
 
  #startvalue = c(4,0,10)
  chain = run_metropolis_MCMC(regressionData, N, B, varianceMatrix, normFactor, var)
  
  burnIn = 5000
  acceptance = 1-mean(duplicated(chain[-(1:burnIn),]))
  
  ret <- data.frame(chain[-(1:burnIn), names(B)], chain[-(1:burnIn),"normFactor"], chain[-(1:burnIn),"sd"])
  colnames(ret) <- c(names(B), "normFactor", "sd")
  
  #par(mfrow = c(2,3))
  #hist(chain[-(1:burnIn),1],nclass=30, , main="Posterior of a", xlab="True value = red line" )
  #abline(v = mean(chain[-(1:burnIn),1]))
  #hist(chain[-(1:burnIn),2],nclass=30, main="Posterior of b", xlab="True value = red line")
  #abline(v = mean(chain[-(1:burnIn),2]))
  #hist(chain[-(1:burnIn),3],nclass=30, main="Posterior of sd", xlab="True value = red line")
  #abline(v = mean(chain[-(1:burnIn),3]) )
  #plot(chain[-(1:burnIn),1], type = "l", xlab="True value = red line" , main = "Chain values of a", )
  #plot(chain[-(1:burnIn),2], type = "l", xlab="True value = red line" , main = "Chain values of b", )
  #plot(chain[-(1:burnIn),3], type = "l", xlab="True value = red line" , main = "Chain values of sd", )
  
  print(acceptance)
  
  return(ret)
  
}

bayesfit2<-function(regressionData, N, normFactor) {
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
  #sigma<-df.residual*s2/rchisq(N,df.residual)
  #coef.sim<-sapply(sigma, function(x) {
  #  Vn <- calcVn(x, covar, lmfit)
  #  Wn <- calcWn(Vn, x, means, covar, lmfit)
  #  mvrnorm(1,Wn,Vn)
  #})
  
  for(i in 1:N){
    scaleFactor <- rnorm(normFactor$mean, normFactor$variance)
    priorWeights <- mvrnorm(1, means, covar)
    scaledPriorWeights <- scaleFactor * priorWeights
    
    res <- sapply(regressionData, function(datapoint){
      res <- datapoint$Effort - scalePriorWeights %*% datapoint[, -c("Effort")]
    })
    
    results <- list()
    results$res <- res
    results$scaleFactor <- scaleFactor
    results$priorWeights <- priorWeigths
  }
 
  
  library(plyr)
  counts <- ddply(df, .(df$y, df$m), nrow)
  names(counts) <- c("y", "m", "Freq")
  
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
  
  #newdata = testData
  #model = bayesianModel
  #print(mean(model[, col]))
  
  `%ni%` <- Negate(`%in%`)
  #print(colnames(newdata))
  #print(colnames(model))
  newdata <- subset(newdata,select = colnames(newdata) %ni% c("Effort"))
	ret <- apply(newdata, 1, function(x) {
				effort <- 0
				for (col in colnames(newdata)) {
					effort <- effort + (mean(model[, col]) * x[col])
				}
				effort
			})
	ret*mean(model[,"normFactor"])
}

calNormFactor <- function(regressionData, n){
  #n <- length(levels)
  #if(n == 1){
  #  return(1)
  #}
  nominalWeights <- genMeans(n)
  nominalWeights <- as.matrix(nominalWeights)
  #print(nominalWeights)
  transactionData <- as.matrix(regressionData[, !(colnames(regressionData) %in% c("Effort"))])
  transactionSum <-  transactionData %*% nominalWeights 
  transactionRegressionData <- matrix(nrow = nrow(regressionData), ncol=2)
  colnames(transactionRegressionData) <- c("transactionSum", "Effort")
  rownames(transactionRegressionData) <- rownames(regressionData)
  transactionRegressionData[, "transactionSum"] = transactionSum
  transactionRegressionData[, "Effort"] = regressionData[, "Effort"]
  
  transactionRegressionData <- transactionRegressionData[rownames(regressionData) != "Aggregate", ]
  
  summary <- summary(lm(Effort ~ . - 1, as.data.frame(transactionRegressionData)))

  normFactor <- c(mean = summary$coefficients["transactionSum","Estimate"], var=summary$coefficients["transactionSum","Std. Error"]^2)
  #regressionData[, "Effort"]/normFactor
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
  
  #n = 6
  #effortData = effort
  #transactionFiles = transactionFiles
  #parameters = c("TL")
  #k = 5
  #i = 6
  
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
    numOfTrans <- 0
    for (project in projects) {
        filePath <- transactionFiles[project, "transaction_file"]
        print(filePath)
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
        numOfTrans = numOfTrans + nrow(fileData)
        classifiedData <- classify(fileData, cutPoints)
        regressionData[project, ] <- c(classifiedData, effortData[project, "Effort"])
    }
    
    print(numOfTrans)
  
    regressionData <- na.omit(regressionData)
    regressionData <- rbind(regressionData, "Aggregate" = colSums(regressionData))
    regressionData <- as.data.frame(regressionData)
    
    # the variance is actually not used.
    normFactor <- calNormFactor(regressionData, length(levels))
    print(normFactor)
  
    #normalizedData <- regressionData[rownames(regressionData) != "Aggregate", ]
    #normalizedData$Effort <- normalizedData$Effort/normFactor
    #bayesianModel <- bayesfit(lm(Effort ~ . - 1, normalizedData), 1000)
    
    means <- genMeans(length(levels))
    #print(means)
    covar <- genVariance(means, 1/3)
    
    bayesianModel <- bayesfit3(regressionData[rownames(regressionData) != "Aggregate", ], 10000, means, covar, normFactor['mean'], normFactor['var'])
    
    validationResults <- crossValidate(regressionData[rownames(regressionData) != "Aggregate", ], k)
    
    #validationResults <- crossValidate(regressionData, k, means, covar, normFactor['mean'], normFactor['var'])
    
    print(cutPoints)
    #print("cross validation")
    searchResults[[i]] <- list(
                               numOfTrans = numOfTrans,
                               MSE = validationResults["MSE"], 
                               MMRE = validationResults["MMRE"], 
                               PRED = validationResults["PRED"],
                               model = bayesianModel,
                               modelAvg = lapply(bayesianModel, mean),
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
  predicted*trainedModel*trainedMOdel$normFactor
}

