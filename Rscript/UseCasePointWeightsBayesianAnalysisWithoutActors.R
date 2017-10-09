#!/usr/bin/env Rscript

#arg1: data url
#arg2: a priori use case and actor weights
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least 2 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
}

dataUrl <- args[1]
apriori <- args[2]
outputPath <- args[3]
reportPath <- paste(outputPath,'use-case-point-weight-calibration-report.txt', sep='/')
#linearRegressionPlotPath <- paste(outputPath,'use-case-point-linear-regression-plot.png', sep='/')
#independentVariablesScatterPlotPath <- paste(outputPath,'use-case-point-independent-variable-scatter-plot.png', sep='/')

# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

library(lattice)
#library(latticeExtra)
# set the output file
#library(reshape)
#library(dplyr)

#for draw the density plots

library(ggplot2)

sink(reportPath)

useCaseData <- read.csv(dataUrl, header=TRUE)
aprioriData <- read.csv(apriori, header=TRUE)
aprioriData <- aprioriData[c("Simple_UC","Average_UC", "Complex_UC")]
aprioriMeans <- cbind(mean(aprioriData[,"Simple_UC"]), mean(aprioriData[,"Average_UC"]), mean(aprioriData[,"Complex_UC"]))
colnames(aprioriMeans) <- c("Simple_UC", "Average_UC", "Complex_UC")
print('apriori means')
print(aprioriMeans)

aprioriVariance = cbind(var(aprioriData[,'Simple_UC']),var(aprioriData[,'Average_UC']),var(aprioriData[,'Complex_UC']))
colnames(aprioriVariance) = c('Simple_UC', 'Average_UC', 'Complex_UC')
print('apriori variance')
print(aprioriVariance)

# clibrate between the UCP and effort to get the normalizing factor
ucpFit <- lm(Real_Effort_Person_Hours ~ UCP, data=useCaseData)
normFactor <- coef(ucpFit)[c('UCP')]

print("normalized effort")
normEffort <- useCaseData[,'Real_Effort_Person_Hours']/(useCaseData[,'TCF']*useCaseData[,'ECF']*normFactor)
print(normEffort)
useCaseData$norm_effort = normEffort

#print(useCaseData)
print('covariance matrix for apriori data')
print(cor(aprioriData))
print('variance-covariance matrix for apriori data')
print(var(aprioriData))
w1 <- solve(var(aprioriData))
# calculate the precision matrix for the apriori information
c1 <- w1 %*% as.matrix(t(aprioriMeans))
print('weighted apriori calibrated parameters')
print(c1)

fit <- lm(norm_effort ~ Simple_UC + Average_UC + Complex_UC - 1, data=useCaseData)
resVariance <- var(resid(fit))
print("residual variance")
print(resVariance)
useCaseDataX <- useCaseData[c("Simple_UC","Average_UC", "Complex_UC")]
w2 <- t(useCaseDataX) %*% as.matrix(useCaseDataX) / resVariance
#regressionVariance <- solve(w2)
regVariance <- resVariance * solve(t(useCaseDataX) %*% as.matrix(useCaseDataX))
print(w2)
print(regVariance)
coefs <- coef(fit)
#bias <- coefs[c("(Intercept)")]
print('regression calibrated parameters')
print(coefs)
coefs <- coefs[c("Simple_UC","Average_UC", "Complex_UC")]
c2 <- w2 %*% as.matrix(coefs)
print('weighted regression calibrated parameters')
print(c2)



averageCoefs = solve(w1+w2) %*% (c1 + c2)
bayesianVariance = solve(w1+w2)
print('bayesian averaged coefficients')
print(averageCoefs)
print('bayesian variance')
print(bayesianVariance)
#print(bias)

#bayesianModel <- as.formula("norm_effort ~ 5*Simple_UC + 10*Average_UC + 15*Complex_UC")
#print(predict(eval(bayesianModel), useCaseDataX))

#print(by(useCaseDataX, 1:nrow(useCaseDataX), function(row) row * averageCoefs))

bayesianPredictedEffort <- as.matrix(useCaseDataX) %*% averageCoefs
actualEffort <- useCaseData[,"norm_effort"]
residual <- abs(bayesianPredictedEffort - actualEffort)
output <- cbind(bayesianPredictedEffort, predict(fit), actualEffort, residual, abs(residuals(fit)))
colnames(output) <- c("bayesian", "estimated", "actual", "bayesian_residual", "residual")
print(output)
print(mean(residual))
print(mean(abs(residuals(fit))))

print(summary(fit))

#draw the density flots

#Simple use case bayesian averaging plot
dat <- data.frame(dens = c(rnorm(100, aprioriMeans[,'Simple_UC'], aprioriVariance[,'Simple_UC']), rnorm(100, coefs['Simple_UC'], regVariance['Simple_UC', 'Simple_UC']),rnorm(100, averageCoefs['Simple_UC',1], bayesianVariance['Simple_UC', 'Simple_UC']))
		, lines = rep(c("apriori", "regression", "bayesian"), each = 100))
svg(paste(outputPath,"simple_use_case_bayesian_average_plot.svg", sep="/"), width=12, height=4)
print(ggplot(dat, aes(x = dens, fill = lines)) + geom_density(alpha = 0.5)+labs(x="Simple Use Case Weight", fill="Methods"))

#Average use case bayesian averaging plot
dat <- data.frame(dens = c(rnorm(100, aprioriMeans[,'Average_UC'], aprioriVariance[,'Average_UC']), rnorm(100, coefs['Average_UC'], regVariance['Average_UC', 'Average_UC']),rnorm(100, averageCoefs['Average_UC',1], bayesianVariance['Average_UC', 'Average_UC']))
		, lines = rep(c("apriori", "regression", "bayesian"), each = 100))
svg(paste(outputPath,"average_use_case_bayesian_average_plot.svg", sep="/"), width=12, height=4)
print(ggplot(dat, aes(x = dens, fill = lines)) + geom_density(alpha = 0.5))

#Complex use case bayesian averaging plot
dat <- data.frame(dens = c(rnorm(100, aprioriMeans[,'Complex_UC'], aprioriVariance[,'Complex_UC']), rnorm(100, coefs['Complex_UC'], regVariance['Complex_UC', 'Complex_UC']),rnorm(100, averageCoefs['Complex_UC',1], bayesianVariance['Complex_UC', 'Complex_UC']))
		, lines = rep(c("apriori", "regression", "bayesian"), each = 100))
svg(paste(outputPath,"complex_use_case_bayesian_average_plot.svg", sep="/"), width=12, height=4)
print(ggplot(dat, aes(x = dens, fill = lines)) + geom_density(alpha = 0.5))


# 10 fold cross validation of mmre, pred(.25), pred(.50)
# estimate the predication accuracy by n fold cross validation.
#Randomly shuffle the data
useCaseData<-useCaseData[sample(nrow(useCaseData)),]
#Create 10 equally size folds
nfold = 5
folds <- cut(seq(1,nrow(useCaseData)),breaks=nfold,labels=FALSE)

#function
#calculatePreds <- function(mre)
#{
#	pred15 = 0;
#	if (mre <= 0.15){
#		pred15 = 1;
#	}
#	pred25 = 0;
#	if (mre <= 0.25){
#		pred25 = 1;
#	}
#	pred50 = 0;
#	if (mre <= 0.50){
#		pred50 = 1;
#	}
#	return(c(pred15, pred25, pred50))
#}

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(,nrow=nfold,ncol=12)
colnames(foldResults) <- c('bayesian_mmre','bayesian_pred15','bayesian_pred25','bayesian_pred50','apriori_mmre','apriori_pred15','apriori_pred25','apriori_pred50','regression_mmre','regression_pred15','regression_pred25','regression_pred50')
#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	testDataX <- testData[c("Simple_UC","Average_UC", "Complex_UC")]
	trainDataX <- trainData[c("Simple_UC","Average_UC", "Complex_UC")]
	
	print('bayesian testing set predication')
	
	foldFit <- lm(norm_effort ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	foldResVariance <- var(resid(foldFit))
	foldW2 <- t(trainDataX) %*% as.matrix(trainDataX) / foldResVariance
	print(foldW2)
	foldCoefs <- coef(foldFit)
	foldCoefs <- foldCoefs[c("Simple_UC","Average_UC", "Complex_UC")]
	foldC2 <- foldW2 %*% as.matrix(foldCoefs)
	print(foldC2)
	foldAverageCoefs = solve(w1+foldW2) %*% (c1 + foldC2)
	
	#bayesian.mre = apply(testData, 1, function(x))
	bayesian.predict = cbind(as.matrix(testDataX) %*% foldAverageCoefs, testData$norm_effort)
	colnames(bayesian.predict) = c('predicted', "actual")
	print(bayesian.predict)
	bayesian.mre = apply(bayesian.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	bayesian.mmre = mean(bayesian.mre)
	print(bayesian.mmre)
	#bayesian.preds = sapply(bayesian.mre, function(x) calculatePreds(x))
	bayesian.pred15 = length(bayesian.mre[bayesian.mre<=0.15])/length(bayesian.mre)
	bayesian.pred25 = length(bayesian.mre[bayesian.mre<=0.25])/length(bayesian.mre)
	bayesian.pred50 = length(bayesian.mre[bayesian.mre<=0.50])/length(bayesian.mre)
	print(c(bayesian.pred15, bayesian.pred25, bayesian.pred50))
	
	print('apriori testing set predication')
	testDataDesignMatrix = testData[c("Simple_UC","Average_UC", "Complex_UC")]
	apriori.predict = cbind(as.matrix(testDataX) %*% t(aprioriMeans), testData$norm_effort)
	colnames(apriori.predict) = c('predicted', "actual")
	print(apriori.predict)
	apriori.mre = apply(apriori.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	apriori.mmre = mean(apriori.mre)
	print(apriori.mmre)
	#apriori.preds = sapply(apriori.mre, function(x) calculatePreds(x))
	apriori.pred15 = length(apriori.mre[apriori.mre<=0.15])/length(apriori.mre)
	apriori.pred25 = length(apriori.mre[apriori.mre<=0.25])/length(apriori.mre)
	apriori.pred50 = length(apriori.mre[apriori.mre<=0.50])/length(apriori.mre)
	print(c(apriori.pred15, apriori.pred25, apriori.pred50))
	
	print('regression testing set predication')
	regression.m = lm(norm_effort ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	regression.predict = cbind(predicted=predict(regression.m, testData), actual=testData$norm_effort)
	print(regression.predict)
	regression.mre = apply(regression.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	regression.mmre = mean(regression.mre)
	print(regression.mmre)
	#regression.preds = sapply(regression.mre, function(x) calculatePreds(x))
	regression.pred15 = length(regression.mre[regression.mre<=0.15])/length(regression.mre)
	regression.pred25 = length(regression.mre[regression.mre<=0.25])/length(regression.mre)
	regression.pred50 = length(regression.mre[regression.mre<=0.50])/length(regression.mre)
	print(c(regression.pred15, regression.pred25, regression.pred50))
	
	foldResults[i,] = c(bayesian.mmre,bayesian.pred15,bayesian.pred25,bayesian.pred50,apriori.mmre,apriori.pred15,apriori.pred25,apriori.pred50,regression.mmre,regression.pred15,regression.pred25,regression.pred50)
}

#average out the folds.
print('n fold cross validation results')
print(foldResults);
cvResults <- c(
		mean(foldResults[, 'bayesian_mmre']),
		mean(foldResults[, 'bayesian_pred15']),
		mean(foldResults[, 'bayesian_pred25']),
		mean(foldResults[, 'bayesian_pred50']),
		mean(foldResults[, 'apriori_mmre']),
		mean(foldResults[, 'apriori_pred15']),
		mean(foldResults[, 'apriori_pred25']),
		mean(foldResults[, 'apriori_pred50']),
		mean(foldResults[, 'regression_mmre']),
		mean(foldResults[, 'regression_pred15']),
		mean(foldResults[, 'regression_pred25']),
		mean(foldResults[, 'regression_pred50'])
);

names(cvResults) <- c('bayesian_mmre','bayesian_pred15','bayesian_pred25','bayesian_pred50','apriori_mmre','apriori_pred15','apriori_pred25','apriori_pred50','regression_mmre','regression_pred15','regression_pred25','regression_pred50')
print(cvResults)

#also have linear regression on sloc and normalized effort.
sink()

