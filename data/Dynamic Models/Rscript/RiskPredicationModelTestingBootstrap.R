#!/usr/bin/env Rscript



args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least 2 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./Temp"
}

icsmdataUrl <- args[1]
opensourcedataUrl <- args[2]
outputPath <- args[3]
reportPath <- paste(outputPath,'risk-predication-model-testing-report.txt', sep='/')

# dataUrl <- "./Data/Input_Data_Example.csv"
# outputPath <- "./Temp"
# reportPath <- paste(outputPath,'risk-predication-model-training-report.txt', sep='/')

library(lattice)
library(ggplot2)
library(neuralnet)
library(boot)

# setwd("E:/WorkSpace/Huawei/R/Risk_Prediction_Model_Calibration")
#sink(reportPath, append=TRUE, split=TRUE)
sink(reportPath)

modelUrl <- "./Model/riskPredictionMode_icsm_projects.rds"
#open source risk estimation model
model2Url <- "./Model/riskPredictionModel_open_source.rds"

# testing icsm risk prediction model accuracy
nn <- readRDS(modelUrl)
df <- read.csv(icsmdataUrl, header=TRUE, sep=",")
names <- colnames(df)
print('names')
print(names);
riskLabels <- names[grepl("RISK*", names)];
names1 <- (names[!names %in% riskLabels])
print((names[!names %in% riskLabels]))

clsRate<- c()
# Bootstrap 95% CI for R-Squared
# function to obtain R-Squared from the data
# the statistic to evaluate interface, data, control, external invocation, external call, transaction are the same.
# all are for relative error percentage.
# there are two element in each record. The first one is the actual, the second one is from analysis.
i=21
rsq <- function(formula, data, indices) {
	
	d <- data[indices,] # allows boot to select sample
	print(indices)
	pr.nn <- compute(nn, d[, names[!names %in% riskLabels]])
	#print('the predictions results for testing data set')
	#print(pr.nn$net.result)
	runPredictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))
	#print(runPredictions)
	#print("testing data set actual risk")
	runActualCls = as.matrix(apply(d[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	runPredictionResult = apply(cbind(runPredictions, runActualCls), 1, function(x){x[1] == x[2]});
	#print(runPredictionResult)
	#print(length(runPredictionResult[runPredictionResult == TRUE]))
	runClsRate = length(runPredictionResult[runPredictionResult == TRUE])/length(runPredictionResult)
	#runResults <- c()
	#runResults[1] = runClsRate
	#return(runClsRate)
	return(c(runClsRate))
}
# view results
#results

#transaction number bootstrap
#sink(paste(outputPath, 'icsm_prediction_model_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=df, statistic=rsq, R=1000, formula='')

print(results)

print("icsm risk predictin model testing results")
print(mean(results$t[,1]))

# testing open source prediction model accuracy

nn2 <- readRDS(model2Url)
df2 <- read.csv(opensourcedataUrl, header=TRUE, sep=",")
names <- colnames(df2)
print('names')
print(names);
riskLabels <- names[grepl("RISK*", names)];
names2 <- (names[!names %in% riskLabels])
print((names[!names %in% riskLabels]))

# Bootstrap 95% CI for R-Squared
# function to obtain R-Squared from the data
# the statistic to evaluate interface, data, control, external invocation, external call, transaction are the same.
# all are for relative error percentage.
# there are two element in each record. The first one is the actual, the second one is from analysis.
rsq2 <- function(formula, data, indices) {
	
	d <- data[indices,] # allows boot to select sample
	print(indices)
	pr.nn2 <- compute(nn2, d[, names[!names %in% riskLabels]])
	#print('the predictions results for testing data set')
	#print(pr.nn2$net.result)
	runPredictions = as.matrix(apply(pr.nn2$net.result, 1, FUN=which.max))
	#print(runPredictions)
	#print("testing data set actual risk")
	runActualCls = as.matrix(apply(d[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	runPredictionResult = apply(cbind(runPredictions, runActualCls), 1, function(x){x[1] == x[2]});
	#print(runPredictionResult)
	#print(length(runPredictionResult[runPredictionResult == TRUE]))
	runClsRate = length(runPredictionResult[runPredictionResult == TRUE])/length(runPredictionResult)
	return(c(runClsRate))
}
# view results
#results

#transaction number bootstrap
#sink(paste(outputPath, 'icsm_prediction_model_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=df2, statistic=rsq2, R=1000, formula='')

print(results)

print("open source risk prediciton model testing results")
print(mean(results$t[,1]))
#
#}

# testing the entire model
# Bootstrap 95% CI for R-Squared
# function to obtain R-Squared from the data
# the statistic to evaluate interface, data, control, external invocation, external call, transaction are the same.
# all are for relative error percentage.
# there are two element in each record. The first one is the actual, the second one is from analysis.
rsq3 <- function(formula, data, indices) {
	treatment1 = df[sample(nrow(df), 20, replace = TRUE), ]
	treatment2 = df2[sample(nrow(df2), 20, replace = TRUE), ]
	
	#d <- data[indices,] # allows boot to select sample
	#print(indices)
	print("sample");
	print(sample(nrow(df2), 20, replace = TRUE))
	print("teatment")
	print(treatment2)
	pr.nn1 <- compute(nn, treatment1[, names1[!names1 %in% riskLabels]])
	pr.nn2 <- compute(nn2, treatment2[, names2[!names2 %in% riskLabels]])
	
	#combinedPredictionResults <- pr.nn1$net.result + pr.nn2$net.result;
	#combinedPredictionResults <- combinedPredictionResults/sum(combinedPredictionResults)
	#print(combinedPredictionResults)
	runPredictions1 = as.matrix(apply(pr.nn1$net.result, 1, FUN=which.max))
	runPredictions2 = as.matrix(apply(pr.nn2$net.result, 1, FUN=which.max))
	runPredictions = (runPredictions1 + runPredictions2)/2
	#print('the predictions results for testing data set')
	#print(pr.nn2$net.result)
	#runPredictions = as.matrix(apply(pr.nn2$net.result, 1, FUN=which.max))
	#print(runPredictions)
	#print("testing data set actual risk")
	runActualCls1 = as.matrix(apply(treatment1[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	runActualCls2 = as.matrix(apply(treatment2[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	runActualCls = (runActualCls1+runActualCls2)/2
	runPredictionResult = apply(cbind(runPredictions, runActualCls), 1, function(x){x[1] == x[2]});
	#print(runPredictionResult)
	#print(length(runPredictionResult[runPredictionResult == TRUE]))
	runClsRate = length(runPredictionResult[runPredictionResult == TRUE])/length(runPredictionResult)
	return(c(runClsRate))
}
# view results
#results

#transaction number bootstrap
#sink(paste(outputPath, 'icsm_prediction_model_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=df2, statistic=rsq3, R=1000, formula='')

print(results)

print("the final model testing results")
print(mean(results$t[,1]))
#
#}


sink()