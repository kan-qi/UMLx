#!/usr/bin/env Rscript

#arg1: model name
#arg2: input file path
#arg3: summary output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least two arguments must be supplied (input file).n", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = ".\\temp\\prediction_result.txt"
	args[4] = ".\\temp\\prediction_report.txt"
} else if (length(args) == 3){
	args[4] = ".\\temp\\prediction_report.txt"
}

modelUrl <- paste("./data", args[1], sep="/")
dataUrl <- args[2]
resultPath <- args[3]
reportPath <- args[4]


#modelUrl <- "./Model/riskPredictionModel.rds"

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

predM <- readRDS(modelUrl)

print("prediction calculation with:")
#print(nn$model.list$variables)
variables = predM$model.list$variables
names <- colnames(df)
print(df[, names[names %in% variables]])
pr.nn <- compute(nn,df[, names[names %in% variables]])
predictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))

print("prediction results:")
print(pr.nn$net.result)
print(predictions)

sink(resultPath)

#plot(nn)

sink()