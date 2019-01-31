#!/usr/bin/env Rscript

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./Temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath <- paste(outputPath,'risk-predication-model-testing-report.txt', sep='/')

# dataUrl <- "./Data/Input_Data_Example.csv"
# outputPath <- "./Temp"
# reportPath <- paste(outputPath,'risk-predication-model-training-report.txt', sep='/')

library(lattice)
library(ggplot2)
library(neuralnet)

# setwd("E:/WorkSpace/Huawei/R/Risk_Prediction_Model_Calibration")
#sink(reportPath, append=TRUE, split=TRUE)
sink(reportPath)

df <- read.csv(dataUrl, header=TRUE, sep=",")
names <- colnames(df)
print('names')
print(names);
riskLabels <- names[grepl("RISK*", names)];
print((names[!names %in% riskLabels]))

#if(FALSE){
# The following part implement the logic for 5-fold cross validation to estimate the predication accuracy. For cross validation, it is testing out-of-sample predication accuracy, which have better predication on predication accuracy on un-seen data points.
nfold = 10
print("sequence")
print(seq(1,nrow(df)))
folds <- cut(seq(1,nrow(df)),breaks=nfold,labels=FALSE)
#print("folds")
#print(folds)
clsRate <- c()

for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	print("test indexes")
	print(testIndexes)
	trainData <- df[-testIndexes, ]
	testData <- df[testIndexes, ]
	
	fnn <- neuralnet(f, data=trainData, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron
	pr.nn <- compute(nn,testData[c(names[!names %in% riskLabels])])
	
	print('the predictions results for testing data set')
	print(pr.nn$net.result)
	foldPredictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))
	print(foldPredictions)
	print("testing data set actual risk")
	foldActualCls = as.matrix(apply(testData[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	foldPredictionResult = apply(cbind(foldPredictions, foldActualCls), 1, function(x){x[1] == x[2]});
	print(foldPredictionResult)
	#print(length(foldPredictionResult[foldPredictionResult == TRUE]))
	foldClsRate = length(foldPredictionResult[foldPredictionResult == TRUE])/length(foldPredictionResult)
	print(foldClsRate)
	clsRate = append(clsRate, foldClsRate)
}

print("testing results")
print(clsRate)
print(mean(clsRate))

#}

sink()