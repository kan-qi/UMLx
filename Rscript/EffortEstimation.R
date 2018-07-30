#!/usr/bin/env Rscript

#arg1: model name
#arg2: input file path
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

#.libPaths(c("C:/Users/flyqk/Documents/R/win-library/3.5", "C:/Program Files/R/R-3.5.1/library"))

if (length(args) < 2) {
	stop("At least two arguments must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
	args[4] = "effort_prediction"
} else if(length(args) ==3){
	args[4] = "effort_prediction"
}


modelUrl <- paste("./statistical_models", args[1], sep="/")
dataUrl <- args[2]
outputDir <- args[3]
outputFileName <- args[4]
reportPath <- paste(outputDir, paste(outputFileName, '_report.txt', sep=''), sep="/")
resultPath <- paste(outputDir, paste(outputFileName, '_result.json', sep=''), sep="/")

#modelUrl <- "./Model/riskPredictionModel.rds"

# dataUrl <- "./Data/Input_Data_Example.csv"
# outputPath <- "./Temp"
# reportPath <- paste(outputPath,'risk-predication-model-training-report.txt', sep='/')


#print(.libPaths())

library(lattice)
#library(ggplot2)
#library(neuralnet)
library(jsonlite)
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
#close(predM)

print("prediction calculation with:")
#print(nn$model.list$variables)
#variables = predM$model.list$variables
print(predM)
#names <- colnames(df)
#print(df[, names[names %in% variables]])
#prediction <- compute(predM,df[, names[names %in% variables]])

prediction <- predict(predM, df)

print("prediction results:")
print(prediction)

sink(resultPath)
#print(prediction)

print(jsonlite::toJSON(list(result= prediction),pretty = TRUE,auto_unbox = TRUE))
#plot(nn)

sink()
