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
reportPath <- paste(outputPath,'risk-prediction-report.txt', sep='/')
resultsPath <- paste(outputPath,'risk-prediction-results.txt', sep='/')

modelUrl <- "./Model/riskPredictionMode_icsm_projects.rds"
#open source risk estimation model
model2Url <- "./Model/riskPredictionModel_open_source.rds"

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
#print('names')
#riskLabels <- names[grepl("RISK*", names)];
#print(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~"))
#f <- as.formula(paste("RISK1+RISK2+RISK3+RISK4+RISK5~", paste(names[!names %in% "RISK*"], collapse= "+"))) #making a formula to fit to neural net
#f <- as.formula(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~")) #making a formula to fit to neural net
#print(f)

#nn <- neuralnet(f, data=df, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron

# The information that is printed will be output into risk-predication-model-training-report.txt
#print(nn)

#predication for risk model based on COCOMO
nn <- readRDS(modelUrl)

print("prediction calculation with ICSM model:")
#print(nn$model.list$variables)
variables = nn$model.list$variables
print(variables)
names <- colnames(df)
print(df[, names[names %in% variables]])
pr.nn <- compute(nn,df[, names[names %in% variables]])
predictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))

print("prediction results with ICSM model:")
print(pr.nn$net.result)
print(predictions)

print(paste('risk_lvl1', 'risk_lvl2', 'risk_lvl3', 'risk_lvl4', 'risk_lvl5', 'predicted', sep=" "));

for( i in 1:nrow(pr.nn$net.result)){
print(paste(pr.nn$net.result[i,1], pr.nn$net.result[i,2], pr.nn$net.result[i,3], pr.nn$net.result[i,4], pr.nn$net.result[i,5], predictions[i,1], sep=" "));
}
#print(paste("risk_lvl1 ", pr.nn$net.result[1,1]));
#print(paste("risk_lvl2 ", pr.nn$net.result[1,2]));
#print(paste("risk_lvl3 ", pr.nn$net.result[1,3]));
#print(paste("risk_lvl4 ", pr.nn$net.result[1,4]));
#print(paste("risk_lvl5 ", pr.nn$net.result[1,5]));
#print(paste("predicted ", predictions[1,1]))

#plot(nn)

###############################################################
#predication for risk model based on open source data
nn2 <- readRDS(model2Url)

print("prediction calculation with open source model:")
#print(nn$model.list$variables)
variables2 = nn2$model.list$variables
print(variables2)
names2 <- colnames(df)
#print(nn2)
print(df[, names2[names2 %in% variables2]])
pr.nn2 <- compute(nn2,df[, names2[names2 %in% variables2]])
predictions2 = as.matrix(apply(pr.nn2$net.result, 1, FUN=which.max))

print("prediction results with open source model:")
print(pr.nn2$net.result)
print(predictions2)

for( i in 1:nrow(pr.nn$net.result)){
	print(paste(pr.nn$net.result[i,1], pr.nn$net.result[i,2], pr.nn$net.result[i,3], pr.nn$net.result[i,4], pr.nn$net.result[i,5], predictions[i,1], sep=" "));
}

print("final predication with combined results:")
combinedPredictionResults <- pr.nn$net.result + pr.nn2$net.result;
combinedPredictionResults <- combinedPredictionResults/sum(combinedPredictionResults)
print(combinedPredictionResults)
predictions3 = as.matrix(apply(combinedPredictionResults, 1, FUN=which.max))

sink(resultsPath)

print(paste('risk_lvl1', 'risk_lvl2', 'risk_lvl3', 'risk_lvl4', 'risk_lvl5', 'predicted', sep=" "));

for( i in 1:nrow(predictions3)){
	print(paste(combinedPredictionResults[i,1], combinedPredictionResults[i,2], combinedPredictionResults[i,3], combinedPredictionResults[i,4], combinedPredictionResults[i,5], predictions3[i,1], sep=" "));
}

#print(paste("risk_lvl1 ", pr.nn$net.result[1,1]));
#print(paste("risk_lvl2 ", pr.nn$net.result[1,2]));
#print(paste("risk_lvl3 ", pr.nn$net.result[1,3]));
#print(paste("risk_lvl4 ", pr.nn$net.result[1,4]));
#print(paste("risk_lvl5 ", pr.nn$net.result[1,5]));
#print(paste("predicted ", predictions[1,1]))

#plot(nn)

sink()