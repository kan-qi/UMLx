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
	
  	for(i in 1:length(transactionFiles)) {
  	  transactionFile <- transactionFiles[[i]]
  	  if (is.null(data)) {
  	    data <- transactionFile
  	  }
  	  else {
  	    #new <- subset(read.csv(filepath), select = c("TL", "TD", "DETs"))
  	    data <- rbind(data, transactionFile)
  	  }
  	}
	
	data <- data.frame(apply(data, 2, function(x) as.numeric(x)))
	data <- na.omit(data)
	#data <- data[!is.na(data$TL), ]
	#data <- data[!is.na(data$TD), ]
	#data <- data[!is.na(data$DETs), ]
	data
}


empiricalStats <- function(data){
  c(m = mean(data),
  s = sd(data),
  v = var(data),
  l = quantile(data, 0.025),
  u = quantile(data, 0.975))
}

parametricKStest <- function(dist){
  
  #dist <- combined[, "TD"]
  #dist <- combined[, "TL"]
  #dist <- combined[, "DETs"]
  
  tableValues <- table(dist)
  
  #reduce sizes for fitting with gamma curve
  #print(as.integer(tableValues/10))
  
  #dist <- rep(as.numeric(names(tableValues)), as.integer(tableValues/10))
  dist <- rep(as.numeric(names(tableValues)), as.integer(tableValues/100))
  
  #fit.gamma <- fitdist(dist, distr = "gamma", method = "mle", lower = c(0, 0))
  fit.gamma <- fitdist(dist, distr = "gamma")
  plot(fit.gamma)
  
  fit.weibull <- fitdist(dist, "weibull")
  plot(fit.weibull)
  
  fit.lognormal <- fitdist(dist, "lnorm")
  plot(fit.lognormal)
  
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
  
  parametric_test = sum(tests)/runs
  
  parametric_test

}

chisqTest <- function(dist){
  dist <- combined[, "TD"]
  
  
  tableValues <- table(dist)
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

discretize <- function(shape, rate, n) {
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
	
	cutPoints <- qgamma(quantiles, shape, rate, lower.tail = TRUE)
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
  else{
    totalClassifications <- numVariables*numBins - numVariables + 1
    result <- rep(0, totalClassifications)
    names(result) <- genColNames(nrow(cutPoints), numBins)
    if(nrow(data) > 0){
      for (i in 1:nrow(data)) {
      classifications <- c()
      for (p in rownames(cutPoints)) {
        parameterResult <- cut(data[i, p], breaks = cutPoints[p, ], labels = FALSE)
        classifications <- c(classifications, parameterResult)
      }
      combinedClass <- paste("l", classifications[1] + (classifications[2] - 1), sep = "")
      result[combinedClass] <- result[combinedClass] + 1
      }
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
  percent_value <- percent/100
  pred_value <- value <= percent_value
  mean(pred_value)
}

crossValidate <- function(data, k, fit_func, predict_func){
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
  
  #data = regressionData;
  #k = 5;
  folds <- cut(seq(1, nrow(data)), breaks = k, labels = FALSE)
  foldMSE <- vector(length = k)
  foldMMRE <- vector(length = k)
  foldPRED <- vector(length = k)
  for (i in 1:k) {
    testIndexes <- which(folds == i, arr.ind = TRUE)
    testData <- data[testIndexes, ]
    trainData <- data[-testIndexes, ]
    
    model <- fit_func(trainData)
    predicted = predict_func(model, testData)
    
    foldMSE[i] <- mean((predicted - testData$Effort)^2)
    foldMMRE[i] <- calcMMRE(testData$Effort, predicted)
    foldPRED[i] <- calcPRED(testData$Effort, predicted, 25)
  }
  results <- c("MSE" = mean(foldMSE), "MMRE" = mean(foldMMRE), "PRED" = mean(foldPRED))
}


genColNames <- function(nParams, nBins) {
  # Helper function that generates a vector strings representing all possible
  # classifications.
  #
  # Args:
  #   parameters: vector of parameters being analyzed
  #   nBins: number of bins being analyzed
  #
  # Returns:
  #   A vector of strings for all possible classifications.
  if(nParams == 0){
    return(paste("l", 1, sep=""))
  }
  else if (nParams == 1) {
    return(paste("l", 1:nBins, sep = ""))
  }
  else if (nParams == 2) {
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
    #ret <- c(1, 1)
    ret <- c(1, 2)
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


######## likelihood function ################
likelihood <- function(B, effortAdj, sd, x, y){
  #x = regressionData[ , !(names(regressionData) %in% c("Effort"))]
  #y = regressionData[,c("Effort")]
  #B = means
  #print(as.matrix(x))
  #print(t(as.matrix(B)))
  #print(x)
  
  #print(B)
  #print(x)
  pred = effortAdj*(as.matrix(x)%*%as.matrix(B))
  
  singlelikelihoods = dnorm(y, pred, sd, log = T)
  sumll = sum(singlelikelihoods)
  #print("sumll")
  #print(sumll)
  return(sumll)   
}

######## prior function ################
prior <- function(sample, B, varianceMatrix, effortAdj, var){
  
  prior <- rep(0, 3)
  names(prior) <- c("effortAdj", "priorB", "sd")
  #prior['effortAdj'] = dnorm(sample["effortAdj"], effortAdj, sd=sqrt(var), log=T)
  prior['effortAdj'] = dunif(sample["effortAdj"], min=0, max=2000, log = T)
  #print(prior)
  #print(sample)
  #print("norm factor prior prob")
  #print(prior['effortAdj'])
  
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
  
  jointPrior <- (prior['effortAdj']+prior['priorB']+prior['sd'])
  names(jointPrior) <- NULL
  
  #print("join prior")
  #print(sample)
  #print(prior)
  
  return(jointPrior)
}

######## posterior function ################
posterior <- function(sample, B, varianceMatrix, effortAdj, var, x, y){
  #sample = proposal
  #B = priorB
  #x = regressionData[ , !(colnames(regressionData) %in% c("Effort"))]
  #y = regressionData[,c("Effort")]
  priorb = prior(sample, B, varianceMatrix, effortAdj, var)
  likeh = likelihood(sample[names(B)], sample['effortAdj'], sample['sd'], x, y)
  return  (likeh + priorb)
}

######## Metropolis algorithm ################

proposalfunction <- function(B, effortAdj, sd){
  #sd <- 10
  sample <- rep(0, 2*length(B)+2)
  names(sample) <- c(names(B), paste(names(B), "sigma", sep="_"), "effortAdj", "sd")
  
  sigma <- c(0.1)
  if(length(B)>1){
  for (i in 2:length(B)) {
    sigma <- c(sigma, 1/5* (abs(B[i] - B[i - 1]))+0.1)
  }
  }
  #print(sigma)
  #sigma <- rep(0.1, length(B))
  sample[names(B)] <- rnorm(length(B),mean = B, sd = sigma)
  sample["effortAdj"] <- rnorm(1, effortAdj, 0.1)
  sample['sd'] <- rnorm(1, sd, 3)
  sample[paste(names(B), "sigma", sep="_")] <- sigma
  return(sample)
}

proposalProbability <- function(x1, x2){
  #
  # return the proposal probability g(x1|x2)
  #
  #x1 = chain[1,]
  #x2 = proposal
  
  levels <- paste("l", seq(1:((length(x1)-2)/2)), sep="");
  
  #print(levels)
  #print(x1)
  #print(x2)
  #print(x1[levels])
  #print(x2[levels])
  #print(x2[paste(levels, "sigma", sep="_")])
  probB <- sum(dnorm(x1[levels],mean = x2[levels], sd = x2[paste(levels, "sigma", sep="_")], log = T))
  probeffortAdj <- dnorm(x1["effortAdj"], x2["effortAdj"], 0.1, log=T)
  probSD <- dnorm(x1["sd"], x2["sd"], log=T)
  return(probB+probeffortAdj+probSD)
  
}

run_metropolis_MCMC <- function(regressionData, N, priorB, varianceMatrix, effortAdj){
  
  #regressionData <- regressionData
  #N <- 10000
  #priorB <- means
  #varianceMatrix <- covar
  
  chain = matrix(nrow=N+1, ncol=2*length(priorB)+2)
  
  #print(paste(names(priorB), "sigma", sep="_"))
  
  colnames(chain) <- c(names(priorB), paste(names(priorB), "sigma", sep="_"), "effortAdj", "sd")
  
  chain[1, "effortAdj"] <- effortAdj['mean']
  chain[1, "sd"] <- 10

  chain[1, names(priorB)] <- priorB
  sigma <- c(0.1)
  if(length(priorB)>1){
    for (i in 2:length(priorB)) {
      sigma <- c(sigma, 1/5* (abs(priorB[i] - priorB[i - 1]))+0.1)
    }
  }
  chain[1, paste(names(priorB), "sigma", sep="_")] = sigma
  #probabs <- c()
  #acceptance <- c()
  for (i in 1:N){
    proposal = proposalfunction(chain[i,names(priorB)], chain[i,"effortAdj"], chain[i, "sd"])
    #proposal = sample
    `%ni%` <- Negate(`%in%`)
    update <- posterior(proposal, priorB, varianceMatrix, effortAdj['mean'], effortAdj['var'], regressionData[ , !(colnames(regressionData) %in% c("Effort"))], regressionData[,c("Effort")])
    postP <- posterior(chain[i,], priorB, varianceMatrix, effortAdj['mean'], effortAdj['var'], regressionData[ , !(colnames(regressionData) %in% c("Effort"))], regressionData[,c("Effort")])
    probab = min(c(1, exp(update + proposalProbability(chain[i,], proposal) - postP - proposalProbability(proposal, chain[i, ]))))
    #probabs = c(probabs, probab)
    #print(probab)
    #the better way of calculating the acceptance rate
    
    print("posterior prob1:")
    print(postP)
    
    if(is.na(probab) == FALSE & runif(1) < probab){
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

bayesfit<-function(regressionData, N = 1000, burnIn = 500){
  
  #regressionData <- regressionData
  #N <- 1000
  #B <- means
  #varianceMatrix <- covar
  #effortAdj <- effortAdj['mean']
  #var <- effortAdj['var']
  
  effortAdj <- calEffortAdj(regressionData)
  levels = ncol(regressionData) - 1
  B <- genMeans(levels)
  covar <- genVariance(B, 1/3)
  
  chain = run_metropolis_MCMC(regressionData, N, B, covar, effortAdj)
  
  acceptance = 1-mean(duplicated(chain[-(1:burnIn),]))
  
  ret <- data.frame(chain[-(1:burnIn), names(B)], chain[-(1:burnIn),"effortAdj"], chain[-(1:burnIn),"sd"])
  colnames(ret) <- c(names(B), "effortAdj", "sd")
  
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
  
  #print(acceptance)
  
  return(ret)
  
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
  newdata <- subset(newdata,select = colnames(newdata) %ni% c("Effort"))
  
	ret <- apply(newdata, 1, function(x) {
				effort <- 0
				for (col in colnames(newdata)) {
					effort <- effort + (mean(model[, col]) * x[col])
				}
				effort
			})
	
	ret*mean(model[,"effortAdj"])
}

calEffortAdj <- function(regressionData){
  
  summary <- summary(priorFit(regressionData))
  print(summary)

  effortAdj <- c(mean = summary$coefficients["transactionSum","Estimate"], var=summary$coefficients["transactionSum","Std. Error"]^2)
}

priorFit <- function(regressionData){
  nominalWeights <- genMeans(ncol(regressionData)-1)
  nominalWeights <- as.matrix(nominalWeights)
  #print(nominalWeights)
  transactionData <- as.matrix(regressionData[, !(colnames(regressionData) %in% c("Effort"))])
  transactionSum <-  transactionData %*% nominalWeights 
  transactionRegressionData <- matrix(nrow = nrow(regressionData), ncol=2)
  colnames(transactionRegressionData) <- c("transactionSum", "Effort")
  rownames(transactionRegressionData) <- rownames(regressionData)
  transactionRegressionData[, "transactionSum"] = transactionSum
  transactionRegressionData[, "Effort"] = regressionData[, "Effort"]
  
  lm(Effort ~ . - 1, as.data.frame(transactionRegressionData))
}

cachedTransactionFiles = list()
readTransactionData <- function(filePath){
  
  if (!file.exists(filePath)) {
    print(filePath)
    print("file doesn't exist")
    if(is.null(cachedTransactionFiles[[filePath]])){
      cachedTransactionFiles[[filePath]] <<- data.frame(TL = numeric(),
                                                        TD = numeric(), 
                                                        DETs = numeric())
    }
    cachedTransactionFiles[[filePath]]
  }
  else if(!is.null(cachedTransactionFiles[[filePath]])){
    cachedTransactionFiles[[filePath]]
  }
  else {
  #filePath = "D:\\AndroidAnalysis\\GatorAnalysisResults\\ClusteringAnalysis-20190418T224936Z-006\\ClusteringAnalysis\\Timber_S1W1L1\\filteredTransactionEvaluation.csv"
  
  fileData = NULL
  tryCatch(fileData <- read.csv(filePath),  error=function(e) fileData = NULL)
  if(nrow(fileData) == 0 || is.null(fileData)){
    fileData <- data.frame(TL = numeric(),
               TD = numeric(), 
               DETs = numeric())
  }
  else{
  if(nrow(fileData) == 1){
    fileData = apply(subset(fileData, select = c("TL", "TD", "DETs")), 2, function(x) as.numeric(x))
    fileData = t(fileData)
  }
  else{
    fileData = apply(subset(fileData, select = c("TL", "TD", "DETs")), 2, function(x) as.numeric(x))
  }
  fileData <- as.data.frame(fileData)
  }
  fileData <- na.omit(fileData)
  cachedTransactionFiles[[filePath]] <<- fileData
  fileData
  }
  
}

loadTransactionData <- function(modelData){
  
  modelData$transaction_file <- as.character(modelData$transaction_file)
  
  effort <- subset(modelData, select=c("Effort"))
  
  projects <- rownames(modelData)
  
  rownames(effort) <- projects
  
  transactionFileList <- subset(modelData, select=c("transaction_file"))
  rownames(transactionFileList) <- projects
  
  numOfTrans <- 0
  transactionFiles <- list()
  for (project in projects) {
    filePath <- transactionFileList[project, "transaction_file"]
    fileData <- readTransactionData(filePath)
    transactionFiles[[project]] <- fileData
    numOfTrans = numOfTrans + nrow(fileData)
  }
  
  print(numOfTrans)
  
  combined <- combineData(transactionFiles)
  
  #dataSet[["combined"]] <- combined
  #dataSet[["transactionFiles"]] <- transactionFiles
  
  transactionData = list(combined=combined, transactionFiles = transactionFiles, effort = effort, projects=projects)
}


generateRegressionData <- function(projects, cutPoints, effortData, transactionFiles){
  nParams =  nrow(cutPoints)
  nBins =   ncol(cutPoints)-1
  levels = genColNames(nParams, nBins)
  regressionData <- matrix(nrow = length(projects), ncol = length(levels) + 1)
  rownames(regressionData) <- projects
  colnames(regressionData) <- c(levels, "Effort")
  for (project in projects) {
    fileData <- transactionFiles[[project]]
    classifiedData <- classify(fileData, cutPoints)
    regressionData[project, ] <- c(classifiedData, effortData[project, "Effort"])
  }
  
  regressionData <- na.omit(regressionData)
  regressionData <- as.data.frame(regressionData)
}

performSearch <- function(n, dataset, parameters = c("TL", "TD", "DETs"), k = 5) {
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
  
  #n = 1
  #dataset = modelData
  #parameters = c("TL", "TD", "DETs")
  #k = 5
  #dataset <- modelData
  #cachedTransactionFiles <- list()
  
  #load transaction data from the datasheet
  transactionData <- loadTransactionData(dataset)
  
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles = transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  distParams = list();
  distParams[['TL']] = list(shape=6.543586, rate=1.160249);
  distParams[['TD']] = list(shape=3.6492150, rate=0.6985361);
  distParams[['DETs']] = list(shape=1.6647412, rate=0.1691911);
  
  #paramAvg <- if (length(parameters) == 1) mean(combinedData[, parameters]) else colMeans(combinedData[, parameters])
  #paramSD <- if (length(parameters) == 1) sd(combinedData[, parameters]) else apply(combinedData[, parameters], 2, sd)
  
  if(length(parameters) == 0){
    n = 1
  }
  
  searchResults <- list()
  
  for (i in seq(1,n)) {
    cutPoints <- matrix(NA, nrow = length(parameters), ncol = i + 1)
    rownames(cutPoints) <- parameters
    for (p in parameters) {
      cutPoints[p, ] <- discretize(distParams[[p]][['shape']], distParams[[p]][['rate']], i)
    }
    
    #generate classified regression data
    regressionData <- generateRegressionData(projects, cutPoints, effortData, transactionFiles)
    
    paramVals <- bayesfit(regressionData, 10000, 500)
    bayesianModel = list()
    bayesianModel$weights = subset(paramVals, select = levels)
    bayesianModel$effortAdj = paramVals[,"effortAdj"] 
    bayesianModel$sd = paramVals[,"sd"] 
    bayesianModel$cuts <- cutPoints
    
    bm_validationResults <- crossValidate(regressionData, k, function(trainData) bayesfit(trainData, 1000, 500), predict.blm)
    print(bm_validationResults)
    
    #the regression model fit
    regressionModel <- lm(Effort ~ . - 1, as.data.frame(regressionData));
    reg_validationResults <- crossValidate(regressionData, k,function(trainData) lm(Effort ~ . - 1, as.data.frame(trainData)), function(lm.fit, testData) predict(lm.fit, newData = testData))
    
    #the prior model fit
    priorModel <- priorFit(regressionData)
    prior_validationResults <- crossValidate(regressionData, k, priorFit, function(priorModel, testData) predict(priorModel, newData = testData))
    
    searchResults[[i]] <- list(
                               bayesModel = bayesianModel,
                               bayesModelAccuracyMeasure = bm_validationResults,
                               priorModel = priorModel,
                               priorModelAccuracyMeasure = prior_validationResults,
                               regressionModel = regressionModel,
                               regressionModelAccuracyMeasure = reg_validationResults,
                               regressionData = regressionData
                               )
  }
  searchResults
}

#effort <- read.csv("modelEvaluations_8_12.csv")
#rownames(effort) <- effort$Project
#SWTIresults <- performSearch(3, effort, c("TL"))

predict.swt <- function(trainedModel, testData){
  #trainedModelParameters <- readRDS(file="train_model_parameters.rds")
  
  transactionData <- loadTransactionData(testData)
  
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles = transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  #cuts = model$m$cuts
  regressionData <- generateRegressionData(projects, trainedModel$cuts, effortData, transactionFiles)
  
  predicted <- predict.blm(as.matrix(trainedModel$paramVals), newdata = regressionData)
  predicted
}

m_fit.tm1 <- function(swtiii,dataset){
  print("swtiii model training")
  #swtiii <- models$tm1
  #dataset <- modelData
  transactionData <- loadTransactionData(dataset)
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles <- transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  regressionData <- generateRegressionData(projects, swtiii$cuts, effortData, transactionFiles)
  
  paramVals <- bayesfit(regressionData, 10000, 500)
  bayesianModel = list()
  bayesianModel$paramVals <- paramVals
  bayesianModel$cuts <- swtiii$cuts
  
  swtiii$cuts = NULL;
  swtiii$m = bayesianModel;
  swtiii
}

# for model testing
m_predict.tm1 <- function(swtiii, testData){
  print("swtiii predict function")
  #print(swtiii)
  #testData <- modelData
  #using the means for each esimulation results as the final estimates of the parameters
  #No need for calculating mean here: swtiii_model <- apply(swtiii$m$paramVals, 2, mean)
  
  predict.swt(swtiii$m, testData)
}

trainsaction_based_model <- function(analysisResults, modelSelector){
  # for model training
 
  modelParams = analysisResults[[modelSelector]][["bayesModel"]]
  swtiiiParams = list(
    cuts = modelParams$cuts
  )
}

