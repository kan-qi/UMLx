# This script performs search for the optimal model in predicting effort from
# software size. The measure of software size used is the sum of weighted
# transactions calculated in the following manner:
# 1. Discretize the transaction data based on quantiles of gamma distributions
#    obtained from aggregate data.
# 2. Classify each transaction based on the quantiles it falls in.
# 3. Count the number of points that fall into each quantile and apply weights.
# 4. Sum all the weights.
# This script determines the optimal number of bins and the weights to apply
# using matropolis-hasting algorithm to simulate posterior distributions and k-fold cross validation.
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
library(classInt)

combineData <- function(transactionFiles) {
	# Combines all the data from multiple transaction analytics files into one
	# data frame.
	#
	# Args:
	#   folder: folder containing all the files
	#
	# Returns:
	#   A data frame containing all the data in all the files.
  
  if(length(transactionFiles) == 0){
    data <- data.frame(TL = numeric(), TD = numeric(),  DETs = numeric())
  }
  else{
	data <- NULL
	
  	for(i in 1:length(transactionFiles)) {
  	  transactionFile <- transactionFiles[[i]]
  	  if (is.null(data)) {
  	    data <- transactionFile
  	  }
  	  else {
  	    data <- rbind(data, transactionFile)
  	  }
  	}
  }
	data <- data.frame(apply(data, 2, function(x) as.numeric(x)))
	data <- na.omit(data)
	data
}


empiricalStats <- function(data){
  # summarize the distribution parameters 
  #
  # Args:
  #   data: a data set for the empirical distribution.
  #
  # Returns:
  #   the parameters of the empirical distribution.
  
  c(m = mean(data),
  s = sd(data),
  v = var(data),
  l = quantile(data, 0.025),
  u = quantile(data, 0.975))
}


distFit <- function(dist){
  tableValues <- table(dist)
  
  dist <- rep(as.numeric(names(tableValues)), as.integer(tableValues/100))
  
  #fit.gamma <- fitdist(dist, distr = "gamma", method = "mle", lower = c(0, 0))
  fit.gamma <- fitdist(dist, distr = "gamma")
  #fit.weibull <- fitdist(dist, "weibull")
  #fit.lognormal <- fitdist(dist, "lnorm")
  
  # Check result
  shape = coefficients(fit.gamma)["shape"]
  rate = coefficients(fit.gamma)["rate"]
  
  list(shape=shape, rate=rate)
}

parametricKStest <- function(dist, shape, rate){
  # perform parametric kermogorov smirnov test for goodness of fit of gamma distribution. 
  #
  # Args:
  #   dist: an empirical distribution to perform goodness of fit test
  #
  # Returns:
  #   the p-value of k-s test
  
  ksResult <- ks.test(dist, "pgamma", shape, rate)
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

discretize <- function(dataset, n, fit=FALSE) {
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
  
  if(fit){
  quantiles <- seq(1/n, 1 - (1/n), 1/n)
  params <- distFit(dataset)
	cutPoints <- qgamma(quantiles, params$shape, params$rate, lower.tail = TRUE)
	cutPoints <- c(-Inf, cutPoints, Inf)
  }
  else{
  cutPoints <- as.vector(classIntervals(dataset, n)$brks)
  cutPoints[1] <- -Inf
  cutPoints[length(cutPoints)] <- Inf
  lastPoint <- -1;
    for(i in 1:length(cutPoints)){
      if(cutPoints[i] <= lastPoint){
        cutPoints[i] = lastPoint+0.1;
      }
      lastPoint = cutPoints[i]
    }
  cutPoints
  }
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
  
  #data <- fileData
  
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
      sumCoord <- 0
      #classifications <- c()
      for (p in rownames(cutPoints)) {
        parameterResult <- cut(data[i, p], breaks = cutPoints[p, ], labels = FALSE)
        #classifications <- c(classifications, parameterResult)
        sumCoord <- sumCoord + parameterResult
      }
      combinedClass <- paste("l", sumCoord-nrow(cutPoints)+1, sep = "")
      result[combinedClass] <- result[combinedClass] + 1
      }
    }
    return(result)
  }
}

#calcMMRE <- function(testData, pred) {
  # Calculates mean magnitude relative error (MMRE).
  #
  # Args:
  #   testData: known results to validate against
  #   pred: predicted results from the model
  #
  # Returns:
  #   MMRE
#  mmre <- abs(testData - pred)/testData
#  mean_value <- mean(mmre)
#  mean_value
#}

#calcPRED <- function(testData, pred, percent) {
  # Calculates percentage relative error deviation (PRED).
  #
  # Args:
  #   testData: known results to validate against
  #   pred: predicted results from the model
  #   percent: percent error threshold to accept predicted value
  #
  # Returns:
  #   PRED
  
#  value <- abs(testData - pred)/testData
#  percent_value <- percent/100
#  pred_value <- value <= percent_value
#  mean(pred_value)
#}


mre <- function(x) abs(x[1] - x[2])/x[2]
mmre <- function(mre) mean(mre)
pred15 <- function(mre) length(mre[mre<=0.15])/length(mre)
pred25 <- function(mre) length(mre[mre<=0.25])/length(mre)
pred50 <- function(mre) length(mre[mre<=0.50])/length(mre)
mdmre <- function(mre) median(mre)

mse <-  function(x) mean((x[, 1] - x[, 2])^2)
mae<- function(x) sum(apply(x, 1, function(x) abs(x[1] - x[2])))/length(x)

crossValidate <- function(data, k, fit_func, predict_func){
  # Performs k-fold cross validation with Bayesian linear regression as training 
  # method.
  #
  # Args:
  #   data: the data to perform cross-validation with
  #   k: number of folds to use
  #    fit_func: the fit function based on the datasets
  #    predict_func: the predict function for unseen cases
  #
  # Returns:
  #   A vector of mean MSE, MMRE, PRED(0.25) for all folds.
  
  #data <- regressionData
  #k <- 5
  
  folds <- cut(seq(1, nrow(data)), breaks = k, labels = FALSE)
  foldMSE <- vector(length = k)
  foldMMRE <- vector(length = k)
  foldPRED15 <- vector(length = k)
  foldPRED25 <- vector(length = k)
  foldPRED50 <- vector(length = k)
  foldMDMRE <- vector(length = k)
  foldMAE <- vector(length = k)
  for (i in 1:k) {
    testIndexes <- which(folds == i, arr.ind = TRUE)
    testData <- data[testIndexes, ]
    trainData <- data[-testIndexes, ]
    
    model <- fit_func(trainData)
    predicted = predict_func(model, testData)
    actual = testData$Effort
    names(actual) <- rownames(testData)
    #print("predicted:")
    #print(predicted)
    #print("actual:")
    #print(testData$Effort)
    intersectNames <- intersect(names(predicted), names(actual))
    #print(intersectNames)
    predict_vs_actual = data.frame(predicted = predicted[intersectNames],actual=actual[intersectNames])
    #print(predict_vs_actual)
    mre_vals = apply(predict_vs_actual, 1, mre)
    #foldMMRE[i] <- calcMMRE(testData$Effort, predicted)
    #foldPRED[i] <- calcPRED(testData$Effort, predicted, 25)
    # relative errors
    foldMMRE[i] <- mmre(mre_vals)
    foldPRED15[i] <- pred15(mre_vals)
    foldPRED25[i] <- pred25(mre_vals)
    foldPRED50[i] <- pred50(mre_vals)
    foldMDMRE[i] <- mdmre(mre_vals)
    
    # absolute errors
    foldMSE[i] <- mse(predict_vs_actual)
    foldMAE[i] <- mae(predict_vs_actual)
  }
  results <- c("MSE" = mean(foldMSE),
               "MAE" = mean(foldMAE),
               "MMRE" = mean(foldMMRE),
               "PRED15" = mean(foldPRED15),
               "PRED25" = mean(foldPRED25),
               "PRED50" = mean(foldPRED50),
               "MDMRE" = mean(foldMDMRE)
               )
}

# rank the models
rankModels <- function(accuracyMeasures){
  accuracy_metrics <- names(accuracyMeasures)
  cvRankResults <- data.frame(matrix(nrow=nrow(accuracyMeasures), ncol=0))
  print(accuracy_metrics)
  for (i in 1:length(accuracy_metrics)){
    g = accuracy_metrics[i]
    #print(g)
    selectedData <- data.frame(matrix(nrow=nrow(accuracyMeasures), ncol=0))
    selectedData[g] <- accuracyMeasures[, g]#delete the metric_labels
    #print(selectedData)
    if(g == "MMRE" || g == "MDMRE" || g == "MAE" || g == "MSE"){
      selectedData[paste("rank", i, sep = "")] <- rank(selectedData[,g], ties.method = "min")
    }else{
      selectedData[paste("rank", i, sep = "")] <- rank(-selectedData[,g], ties.method = "min")
    }
    
    cvRankResults <- cbind(cvRankResults, selectedData)
  }
  
  
  #make a total rank(rank*) base on the ranks
  rank_sum <- vector(mode = "integer",length = nrow(cvRankResults))
  for (i in 1:nrow(cvRankResults)){
    selectedData <- cvRankResults[i,]
    for(j in 1:length(accuracy_metrics)){
      rank_sum[i] <- rank_sum[i] + selectedData[,2*j]
    }
  }
  
  rank_sum <- rank(rank_sum, ties.method = "min")
  #print(rank_sum)
  cvRankResults["rank*"] <- rank_sum
  cvRankResults
}

#profile iteration data
profileIterationData <- function(iterResults){
  lcuts <- lapply(iterResults, function(iterationResult){
    iterationResult$bayesModel$cuts
  })
  
  laccuracy <- as.data.frame(t(sapply(iterResults, function(iterationResult){
    iterationResult$bayesModelAccuracyMeasure[c('MMRE', 'PRED25', 'MAE', "MDMRE")]
    #iterationResult$bayesModelAccuracyMeasure[c('MMRE', 'PRED', 'MSE')]
  })))
  
  #print(laccuracy)
  accuracyRanks <- rankModels(laccuracy)
  #print(as.matrix(accuracyRanks))
  
  trainedModels <- lapply(iterResults, function(iterationResult){
      trainedModel = cbind(as.data.frame(lapply(iterationResult$bayesModel$weights,Bayes.sum)),
        as.data.frame(Bayes.sum(iterationResult$bayesModel$effortAdj)),
        as.data.frame(Bayes.sum(iterationResult$bayesModel$sd))
      )
      tm <- t(as.matrix(trainedModel))
      colnames(tm) <- 	c("mean","se","t","median","CrI", "CrI")
      rownames(tm) <- c(names(iterationResult$bayesModel$weights), 'effortAdj', "sd")
      tm
  })
  
  list(lcuts = lcuts, laccuracy = round(accuracyRanks, 2), trainedModels = trainedModels)
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
  # Calcuate the likelihood of the weights and effort adjustment factor with respect to the data set (x,y)
  #
  # Args:
  #   B: the weights
  #   effortAdj: the effort adjustment factor
  #
  # Returns:
  #   the likelihood of B and effortAdj
  
  #x = regressionData[ , !(names(regressionData) %in% c("Effort"))]
  #y = regressionData[,c("Effort")]
  #B = means
  
  pred = effortAdj*(as.matrix(x)%*%as.matrix(B))
  
  singlelikelihoods = dnorm(y, pred, sd, log = T)
  sumll = sum(singlelikelihoods)
  
  return(sumll)   
}

######## prior function ################
prior <- function(sample, B, varianceMatrix, effortAdj, var){
  # Calcuate the prior probability of the weights and effort adjustment factor
  #
  # Args:
  #   sample: the sampled weights and effort adjustment factor
  #   B: the expected values for the weights
  #   varianceMatrix: the variance matrix for the weights
  #   effortAdj: the expected value for effort adjustment factor
  #   var: the variance of the effort adjustment factor
  #
  # Returns:
  #   the prior probability of the weights and effort adjustment factor
  
  prior <- rep(0, 3)
  names(prior) <- c("effortAdj", "priorB", "sd")
  
  #the prior probability of effort adjustment factor under uniform distribution
  #prior['effortAdj'] = dnorm(sample["effortAdj"], effortAdj, sd=sqrt(var), log=T)
  prior['effortAdj'] = dunif(sample["effortAdj"], min=0, max=20000, log = T)
  
  #the prior probability of weights under multi-variate norm distribution
  prior["priorB"] <- dmvnorm(sample[names(B)], B, varianceMatrix, log=T)
  
  #Jeffrey's prior
  prior['sd'] <- log(1/sample['sd'])
  #prior['sd'] <- dinvgamma(sample["sd"], 0.1, 0.1, log=T)
  #prior['sd'] <- dunif(sample["sd"], min=0, max=30, log = T)
  
  jointPrior <- (prior['effortAdj']+prior['priorB']+prior['sd'])
  names(jointPrior) <- NULL
  
  return(jointPrior)
}

######## posterior function ################
posterior <- function(sample, B, varianceMatrix, effortAdj, var, x, y){
  # Calcuate the posterior probability of the weights and effort adjustment factor
  #
  # Args:
  #   sample: the sampled weights and effort adjustment factor
  #   B: the expected values for the weights
  #   varianceMatrix: the variance matrix for the weights
  #   effortAdj: the expected value for effort adjustment factor
  #   var: the variance of the effort adjustment factor
  #
  # Returns:
  #   the posterior probability of the weights and effort adjustment factor based on their likelihood and prior probability.
  
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
  # propose a random move based on previous state under certain probabilities
  #
  # Args:
  #   B: the previous weights
  #   effortAdj: the previous effort adjustment factor
  #   sd: the previous standard deviation of the residual
  #
  # Returns:
  #   the next random state
  
  #sd <- 10
  sample <- rep(0, 2*length(B)+2)
  names(sample) <- c(names(B), paste(names(B), "sigma", sep="_"), "effortAdj", "sd")
  
  sigma <- c(0.1)
  if(length(B)>1){
    for (i in 2:length(B)) {
      sigma <- c(sigma, 1/5* (abs(B[i] - B[i - 1]))+0.1)
    }
  }
  
  sample[names(B)] <- rnorm(length(B),mean = B, sd = sigma)
  sample["effortAdj"] <- rnorm(1, effortAdj, 0.1)
  sample['sd'] <- rnorm(1, sd, 3)
  sample[paste(names(B), "sigma", sep="_")] <- sigma
  return(sample)
}

proposalProbability <- function(x1, x2){
  # calculate the proposal probability
  #
  # Args:
  #   x1: the current state
  #   x2: the proposed state
  #
  # Returns:
  #   the proposal probability g(x1|x2)
  
  #x1 = chain[1,]
  #x2 = proposal
  
  levels <- paste("l", seq(1:((length(x1)-2)/2)), sep="");
  
  probB <- sum(dnorm(x1[levels],mean = x2[levels], sd = x2[paste(levels, "sigma", sep="_")], log = T))
  probeffortAdj <- dnorm(x1["effortAdj"], x2["effortAdj"], 0.1, log=T)
  probSD <- dnorm(x1["sd"], x2["sd"], log=T)
  return(probB+probeffortAdj+probSD)
  
}

run_metropolis_MCMC <- function(regressionData, N, priorB, varianceMatrix, effortAdj){
  # run metropolis-hasting algorithm to simulate the posterior probability
  #
  # Args:
  #   regressionData: the classified transactions
  #   N: the number of runs of simulation
  #   priorB: the prior expected value of weights
  #   varianceMatrix: the variance matrix for the weights
  #   effortAdj: the prior effort adjustment factor
  #
  # Returns:
  #   the simulated posterior joint distribution of the parameters
  
  #regressionData <- regressionData
  #N <- 10000
  #priorB <- means
  #varianceMatrix <- covar
  
  chain = matrix(nrow=N+1, ncol=2*length(priorB)+2)
  
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
  
  for (i in 1:N){
    proposal = proposalfunction(chain[i,names(priorB)], chain[i,"effortAdj"], chain[i, "sd"])
    #proposal = sample
    `%ni%` <- Negate(`%in%`)
    update <- posterior(proposal, priorB, varianceMatrix, effortAdj['mean'], effortAdj['var'], regressionData[ , !(colnames(regressionData) %in% c("Effort"))], regressionData[,c("Effort")])
    postP <- posterior(chain[i,], priorB, varianceMatrix, effortAdj['mean'], effortAdj['var'], regressionData[ , !(colnames(regressionData) %in% c("Effort"))], regressionData[,c("Effort")])
    probab = min(c(1, exp(update + proposalProbability(chain[i,], proposal) - postP - proposalProbability(proposal, chain[i, ]))))
    #the better way of calculating the acceptance rate
    
    acceptance = c()
    if(is.na(probab) == FALSE & runif(1) < probab){
      chain[i+1,] = proposal
      #print("accept")
      acceptance = c(acceptance, 1)
    }else{
      chain[i+1,] = chain[i,]
      #print("not accept")
      acceptance = c(acceptance, 0)
    }
  }
  
  #print(paste("acceptance rate:", sum(acceptance)/N))
  
  return(chain)
}

bayesfit<-function(regressionData, N = 1000, burnIn = 500){
  # apply metropolis hastings algorithm to simulate the posterior distributions of the parameters
  #
  # Args:
  #   regressionData: the classified transactions
  #   N: the number of runs of simulation
  #   burnIn: the first number of iterations which are regarded as burn-in
  #
  # Returns:
  #   the simulated posterior distributions of the parameters
  
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
	
	size <- calculateSize(model, newdata)
	adj <- mean(model[,"effortAdj"])
	size*adj
}

calculateSize <- function(model, data){
  # Args:
  #   model: a bayes linear regression model
  #   data: data to perform transaction based size calculation
  #
  # Returns:
  #   Vector of calculated transaction based size measurements
  #newdata <- subset(newdata, !colnames(newdata) %in% c("Effort"))
  
  #data = testData
  #model = bayesianModel
  #print(mean(model[, col]))
  
  `%ni%` <- Negate(`%in%`)
  data <- subset(data,select = colnames(data) %ni% c("Effort"))
  
  ret <- apply(data, 1, function(x) {
    size <- 0
    for (col in colnames(data)) {
      size <- size + (mean(model[, col]) * x[col])
    }
    size
  })
}

calEffortAdj <- function(regressionData){
  # calcuate an approximation of effort adjustment factor based on classified transactions
  #
  # Args:
  #   regressionData: the classified transaction and effort data
  #
  # Returns:
  #   an approximation of effort adjustment factor based on linear regression with prior weights
  
  summary <- summary(priorFit(regressionData))
  #print(summary)

  effortAdj <- c(mean = summary$coefficients["transactionSum","Estimate"], var=summary$coefficients["transactionSum","Std. Error"]^2)
}

priorTranSum <- function(regressionData){
  nominalWeights <- as.matrix(genMeans(ncol(regressionData)-1))
  transactionData <- as.matrix(regressionData[, !(colnames(regressionData) %in% c("Effort"))])
  transactionSum <-  transactionData %*% nominalWeights 
  transactionSum
}

priorFit <- function(regressionData){
  # fit a linear model using the same of weighted transaction. The weights are prior weights.
  #
  # Args:
  #   regressionData: the classified transaction and effort data
  #
  # Returns:
  #   the fitted linear model using the prior weights
  
 
  transactionRegressionData <- matrix(nrow = nrow(regressionData), ncol=2)
  colnames(transactionRegressionData) <- c("transactionSum", "Effort")
  rownames(transactionRegressionData) <- rownames(regressionData)
  transactionRegressionData[, "transactionSum"] = priorTranSum(regressionData)
  transactionRegressionData[, "Effort"] = regressionData[, "Effort"]
  
  lm(Effort ~ . - 1, as.data.frame(transactionRegressionData))
}

cachedTransactionFiles = list()
readTransactionData <- function(filePath){
  # read the transaction data from the file.The transaction data are cached in cachedTransactionFiles for better performance in cross-validation and boostrapping process.
  #
  # Args:
  #   regressionData: the classified transaction and effort data
  #
  # Returns:
  #   the fitted linear model using the prior weights
  #filePath = "d:/AndroidAnalysis/GatorAnalysisResults4/S1W1L1_5_29/prey_S1W1L1_2019-4-28@1559052797326_analysis/filteredTransactionEvaluation.csv"
  if(!is.null(cachedTransactionFiles[[filePath]])){
    #print("cache exits")
    cachedTransactionFiles[[filePath]]
  } else if (!file.exists(filePath)) {
    print(filePath)
    print("file doesn't exist")
    if(is.null(cachedTransactionFiles[[filePath]])){
      cachedTransactionFiles[[filePath]] <<- data.frame(TL = numeric(),
                                                        TD = numeric(), 
                                                        DETs = numeric())
    }
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
  # load the transaction data from the transaction file paths column of model data
  #
  # Args:
  #   modelData: the model data with various fields to describe a project and a colum to reference the associated transaction data
  #
  # Returns:
  #   the transaction data for each project
  
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
    #print(filePath)
    fileData <- readTransactionData(filePath)
    transactionFiles[[project]] <- fileData
    numOfTrans = numOfTrans + nrow(fileData)
  }
  
  print(numOfTrans)
  
  combined <- combineData(transactionFiles)
  
  transactionData = list(combined=combined, transactionFiles = transactionFiles, effort = effort, projects=projects)
}


generateRegressionData <- function(projects, cutPoints, effortData, transactionFiles){
  # classified the transactions into different levels of complexity for regression analysis
  #
  # Args:
  #   projects: the projects
  #   cutPoints: the cut points that define the classification of the transactions.
  #   effortData: the effort for the projects
  #   transactionFiles: the tranaction records for the projects
  #
  # Returns:
  #   the numbers of transactions for different complexity levels and project effort.
  
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
  
  #n = 6
  #dataset = modelData
  #parameters = c("TL", "TD", "DETs")
  #k = 5
  #dataset <- modelData
  #cachedTransactionFiles <- list()
  
  #load transaction data from the datasheet
  transactionData <- loadTransactionData(dataset)
    
  #distParams = list();
  #distParams[['TL']] = list(shape=6.543586, rate=1.160249);
  #distParams[['TD']] = list(shape=3.6492150, rate=0.6985361);
  #distParams[['DETs']] = list(shape=1.6647412, rate=0.1691911);
  
  
  #Ks parameteric test
  #distParams = list();
  #print(combinedData[,])
  #hist(combinedData[combinedData$TL < 20 & combinedData$TL > 2,"TL"])
  #hist(combinedData[combinedData$TD < 100, "TD"])
  #hist(combinedData[combinedData$DETs < 10, "DETs"])
  #n <- 5
  #quantiles <- seq(1/n, 1 - (1/n), 1/n)
  #print(classIntervals(combinedData[combinedData$DETs < 30, "DETs"], 6, style = 'quantile'))
  #print(classIntervals(combinedData[,"TL"], 4)$brks)
  #print(quantize(combinedData[,"TL"], quantiles))
  
  #distParams[['TL']] = (combinedData[combinedData$TL < 20 & combinedData$TL > 2,"TL"]);
  #distParams[['TD']] = distFit(combinedData[combinedData$TD < 1000, "TD"]);
  #distParams[['DETs']] = distFit(combinedData[combinedData$DETs < 10, "DETs"]);
  
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
      cutPoints[p, ] <- discretize(transactionData$combined[,p], i)
    }
    #generate classified regression data
    regressionData <- generateRegressionData(transactionData$projects, cutPoints, transactionData$effort, transactionData$transactionFiles)
    
    `%ni%` <- Negate(`%in%`)
    paramVals <- bayesfit(regressionData, 50000, 500)
    bayesianModel = list()
    bayesianModel$weights = subset(paramVals, select = colnames(regressionData) %ni% c("Effort", "sd"))
    bayesianModel$effortAdj = paramVals[,"effortAdj"] 
    bayesianModel$sd = paramVals[,"sd"] 
    bayesianModel$cuts <- cutPoints
    
    bm_validationResults <- crossValidate(regressionData, k, function(trainData) bayesfit(trainData, 50000, 500), predict.blm)
    #print(bm_validationResults)
    
    #the regression model fit
    regressionModel <- lm(Effort ~ . - 1, as.data.frame(regressionData));
    reg_validationResults <- crossValidate(regressionData, k,function(trainData) lm(Effort ~ . - 1, as.data.frame(trainData)), function(lm.fit, testData) {
      predictedVals <- predict(lm.fit, testData)
      names(predictedVals) <- rownames(testData)
      #print(rownames(testData))
      #print(predictedVals)
      predictedVals
    })
    
    #the prior model fit
    priorModel <- priorFit(regressionData)
    prior_validationResults <- crossValidate(regressionData, k, priorFit, function(priorModel, testData) {
      predictedVals <- predict(priorModel, data.frame(transactionSum = priorTranSum(testData)))
      names(predictedVals) <- rownames(testData)
      predictedVals
    })
    
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
  # predict the effort based on a data point
  #
  # Args:
  #   trainedModel: the trained transaction-based model
  #   testData: the data point used to predict project effort
  #
  # Returns:
  #   the estimated project effort
  
  
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

fit.swt <- function(swtiii,dataset){
  # the model fitting function which would be repeated called during the cross validation and bootstrapping function
  #
  # Args:
  #   swtiii: a list of cut points, which are the hyper parameters of the transaction-based model.
  #   dataset: the dataset based on which the model is fitted
  #
  # Returns:
  #   the fitted transaction-based model
  
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

m_fit.tm3 <- function(swtiii,dataset){
  
  print("swtiii model training")
  #swtiii <- models$tm1
  #dataset <- modelData
  fit.swt(swtiii, dataset)
}

# for model testing
m_predict.tm3 <- function(swtiii, testData){
  
  print("swtiii predict function")
  
  predict.swt(swtiii$m, testData)
}

m_fit.tm2 <- function(swtii,dataset){
  
  print("swtii model training")
  #swtiii <- models$tm1
  #dataset <- modelData
  fit.swt(swtii, dataset)
}

# for model testing
m_predict.tm2 <- function(swtii, testData){
  
  print("swtii predict function")
  
  predict.swt(swtii$m, testData)
}

m_fit.tm1 <- function(swti,dataset){
  
  print("swti model training")
  #swtiii <- models$tm1
  #dataset <- modelData
  fit.swt(swti, dataset)
}

# for model testing
m_predict.tm1 <- function(swti, testData){
  
  print("swti predict function")
  
  predict.swt(swti$m, testData)
}

trainsaction_based_model <- function(modelData){
  # initiate the transaction-based model by performing a search of optimal classification of transactions, which are defined as a set of cut points
  #
  # Args:
  #   modelData: a held-out dataset to search for the hyperparameter
  #
  # Returns:
  #   the list of cuts points for the individual dimensions
  
  models = list()
  
  start_time1 <- as.numeric(as.numeric(Sys.time())*1000, digits=15)
  #cachedTransactionFiles = list()
  SWTIIIresults <- performSearch(6, modelData, c("TL", "TD", "DETs"))
  #intialize the model with hyper parameters (cutpoints) decided by cross validatoin results for different ways of binning
  end_time1 <- as.numeric(as.numeric(Sys.time())*1000, digits=15)
  run_time1 <- end_time1 - start_time1
  print(paste("SWTIII run time:", run_time1, sep=""))
  
  #SWTIIIresults <- models$tm3$SWTIIIresults
  accuracyMeasures <- as.data.frame(t(sapply(SWTIIIresults, function(iterResults){
    iterResults$bayesModelAccuracyMeasure[c('MMRE', 'PRED25', 'MAE', "MDMRE")]
  })))
  accuracyRanks <- rankModels(accuracyMeasures)
  #print(accuracyRanks)
  #print(accuracyMeasures)
  #SWTIIIModelSelector <- 3
  SWTIIIModelSelector <- which.min(accuracyRanks[,'rank*'])
  print(paste("swtiii: ", SWTIIIModelSelector, sep=""))
 
  modelParams = SWTIIIresults[[SWTIIIModelSelector]][["bayesModel"]]
  
  models$tm3 = list(
    cuts = modelParams$cuts,
    trainedModel = list(
      weights = lapply(modelParams$weights,Bayes.sum),
      effortAdj = Bayes.sum(modelParams$effortAdj),
      sd = Bayes.sum(modelParams$sd)
    ),
    SWTIIIresults = SWTIIIresults
  )
  
  start_time2 <- as.numeric(as.numeric(Sys.time())*1000, digits=15)
  SWTIIresults <- performSearch(6, modelData, c("TL", "TD"))
  #SWTIIModelSelector <- 4
  end_time2 <- as.numeric(as.numeric(Sys.time())*1000, digits=15)
  run_time2 <- end_time2 - start_time2
  print(paste("SWTII run time:", run_time2, sep=""))
  
  #SWTIIresults <- models$tm2$SWTIIresults
  accuracyMeasures <- as.data.frame(t(sapply(SWTIIresults, function(iterResults){
    iterResults$bayesModelAccuracyMeasure[c('MMRE', 'PRED25', 'MAE', "MDMRE")]
  })))
  #print(accuracyMeasures)
  accuracyRanks <- rankModels(accuracyMeasures)
  #print(accuracyRanks)
  SWTIIModelSelector <- which.min(accuracyRanks[,'rank*'])
  #print(SWTIIModelSelector)
  #print(paste("swtiii: ", SWTIIIModelSelector, sep=""))
  
  modelParams = SWTIIresults[[SWTIIModelSelector]][["bayesModel"]]
  
  models$tm2 = list(
    cuts = modelParams$cuts,
    trainedModel = list(
      weights = lapply(modelParams$weights,Bayes.sum),
      effortAdj = Bayes.sum(modelParams$effortAdj),
      sd = Bayes.sum(modelParams$sd)
    ),
    SWTIIresults = SWTIIresults
  )
  
  
  start_time3 <- as.numeric(as.numeric(Sys.time())*1000, digits=15)
  #cachedTransactionFiles = list()
  SWTIresults <- performSearch(6, modelData, c())
  end_time3 <- as.numeric(as.numeric(Sys.time())*1000, digits=15)
  run_time3 <- end_time3 - start_time3
  print(paste("SWTI run time:", run_time3, sep=""))
  
  #intialize the model with hyper parameters (cutpoints) decided by cross validatoin results for different ways of binning
  SWTIModelSelector <- 1
  
  modelParams = SWTIresults[[SWTIModelSelector]][["bayesModel"]]
  end_time <- Sys.time()
  
  models$tm1 = list(
    cuts = modelParams$cuts,
    trainedModel = list(
      weights = lapply(modelParams$weights,Bayes.sum),
      effortAdj = Bayes.sum(modelParams$effortAdj),
      sd = Bayes.sum(modelParams$sd)
    ),
    SWTIresults = SWTIresults
  )
  
  models
  
}


trainsaction_based_model1 <- function(modelData){
  # initiate the transaction-based model by performing a search of optimal classification of transactions, which are defined as a set of cut points
  #
  # Args:
  #   modelData: a held-out dataset to search for the hyperparameter
  #
  # Returns:
  #   the list of cuts points for the individual dimensions
  
  models = list()
  
  #cachedTransactionFiles = list()
  SWTIresults <- performSearch(6, modelData, c())
  #intialize the model with hyper parameters (cutpoints) decided by cross validatoin results for different ways of binning
  SWTIModelSelector <- 1
  
  modelParams = SWTIresults[[SWTIModelSelector]][["bayesModel"]]
  
  models$tm1 = list(
    cuts = modelParams$cuts,
    trainedModel = list(
      weights = lapply(modelParams$weights,Bayes.sum),
      effortAdj = Bayes.sum(modelParams$effortAdj),
      sd = Bayes.sum(modelParams$sd)
    ),
    SWTIresults = SWTIresults
  )
  
  models
  
}

m_profile.tm1 <- function(model, dataset){
  #model = trainedModels[['tm1']]
  #dataset = modelData
  
  swti = model
  transactionData <- loadTransactionData(dataset)
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles <- transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  regressionData1 <- generateRegressionData(projects, swti$m$cuts, effortData, transactionFiles)
 
  regLevels1 <- colnames(regressionData1)[!(colnames(regressionData1) %in% c("Effort"))]

  profileData <- matrix(nrow=nrow(dataset), ncol=length(regLevels1)+1)
  profileData <- as.data.frame(profileData)
  rownames(profileData) <- rownames(dataset)
  
  swti_levels <- paste("swti_", regLevels1, sep="")
  
  colnames(profileData) <- c(swti_levels, "SWTI")
  
  regress1 <- as.matrix(regressionData1[,regLevels1])
  rownames(regress1) <- rownames(regressionData1)
  colnames(regress1) <- swti_levels
  #print(regress1)
  profileData[,swti_levels] <- regress1
  
  profileData$SWTI <- calculateSize(as.matrix(swti$m$paramVals), regressionData1)
 
  profileData
}

m_profile.tm2 <- function(model, dataset){
  #model = trainedModels[["tm2"]]
  #dataset = modelData
  
  swtii = model
  transactionData <- loadTransactionData(dataset)
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles <- transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  regressionData2 <- generateRegressionData(projects, swtii$m$cuts, effortData, transactionFiles)
 
  regLevels2 <- colnames(regressionData2)[!(colnames(regressionData2) %in% c("Effort"))]
  
  profileData <- matrix(nrow=nrow(dataset), ncol=length(regLevels2)+1)
  profileData <- as.data.frame(profileData)
  rownames(profileData) <- rownames(dataset)
  
  swtii_levels <- paste("swtii_", regLevels2, sep="")
  
  colnames(profileData) <- c(swtii_levels, "SWTII")
  
  regress2 <- as.matrix(regressionData2[,regLevels2])
  rownames(regress2) <- rownames(regressionData2)
  colnames(regress2) <- swtii_levels
  #print(regress1)
  profileData[,swtii_levels] <- regress2
  
  profileData$SWTII <- calculateSize(as.matrix(swtii$m$paramVals), regressionData2) 

  profileData
}

m_profile.tm3 <- function(model, dataset){
  #dataset = modelData
  
  swtiii = model
  
  transactionData <- loadTransactionData(dataset)
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles <- transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  regressionData3 <- generateRegressionData(projects, swtiii$m$cuts, effortData, transactionFiles)
  
  regLevels3 <- colnames(regressionData3)[!(colnames(regressionData3) %in% c("Effort"))]
  
  profileData <- matrix(nrow=nrow(dataset), ncol=length(regLevels3)+1)
  profileData <- as.data.frame(profileData)
  rownames(profileData) <- rownames(dataset)
  
  swtiii_levels <- paste("swtiii_", regLevels3, sep="")
  
  colnames(profileData) <- c(swtiii_levels, "SWTIII")
  
  regress3 <- as.matrix(regressionData3[,regLevels3])
  rownames(regress3) <- rownames(regressionData3)
  colnames(regress3) <- swtiii_levels
  #print(regress1)
  profileData[,swtiii_levels] <- regress3
  
  profileData$SWTIII <- calculateSize(as.matrix(swtiii$m$paramVals), regressionData3) 

  profileData
}


trainsaction_based_model3 <- function(modelData){
  # initiate the transaction-based model by performing a search of optimal classification of transactions, which are defined as a set of cut points
  #
  # Args:
  #   modelData: a held-out dataset to search for the hyperparameter
  #
  # Returns:
  #   the list of cuts points for the individual dimensions
  
  #cachedTransactionFiles = list()
  SWTIIIresults <- performSearch(6, modelData, c("TL", "TD", "DETs"))
  #intialize the model with hyper parameters (cutpoints) decided by cross validatoin results for different ways of binning
  #SWTIIIModelSelector <- 3
  #SWTIIIresults <- models$tm3$SWTIIIresults
  accuracyMeasures <- sapply(SWTIIIresults, function(iterResults){
    iterResults$bayesModelAccuracyMeasure[c('PRED', 'MMRE')]
  })
  print(as.data.frame(t(accuracyMeasures)))
  SWTIIIModelSelector <- which.max(accuracyMeasures)
  #print(SWTIIIModelSelector)
  
  modelParams = SWTIIIresults[[SWTIIIModelSelector]][["bayesModel"]]
  
  tm3 = list(
    cuts = modelParams$cuts,
    trainedModel = list(
      weights = lapply(modelParams$weights,Bayes.sum),
      effortAdj = Bayes.sum(modelParams$effortAdj),
      sd = Bayes.sum(modelParams$sd)
    ),
    SWTIIIresults = SWTIIIresults
  )
  
}

transaction_data_profile <- function(dataset){
  transactionData <- loadTransactionData(dataset)
  effortData <- transactionData$effort
  combinedData <- transactionData$combined
  transactionFiles <- transactionData$transactionFiles
  projects <- names(transactionData$transactionFiles)
  
  column_names <- c("Trans", "Stm", "Comp", 
                    "TL", "TL_SE", "TD",
                    "TD_SE", "DETs", "DETs_SE")
  profileData <- matrix(nrow=nrow(dataset), ncol=length(column_names))
  profileData <- as.data.frame(profileData)
  rownames(profileData) <- rownames(dataset)
  
  colnames(profileData) <- column_names
  profileData$Trans <- dataset$Tran_Num
  profileData$Stm <- dataset$Stimulus_Num
  profileData$Comp <- dataset$Component_Num
  attr_means <- as.data.frame(t(sapply(transactionFiles, function(x){sapply(x, mean)})))
  attr_sds <- as.data.frame(t(sapply(transactionFiles, function(x){sapply(x, sd)})))
  profileData$TL <- attr_means$TL
  profileData$TD <- attr_means$TD
  profileData$DETs <- attr_means$DETs
  profileData$TL_SE <- attr_sds$TL
  profileData$TD_SE <- attr_sds$TD
  profileData$DETs_SE <- attr_sds$DETs
  profileData
}

