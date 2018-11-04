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
reportPath <- paste(outputPath,'open-source-risk-predication-model-training-report.txt', sep='/')

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
#print(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~"))
#f <- as.formula(paste("RISK1+RISK2+RISK3+RISK4+RISK5~", paste(names[!names %in% "RISK*"], collapse= "+"))) #making a formula to fit to neural net
f <- as.formula(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~")) #making a formula to fit to neural net
print((names[!names %in% riskLabels]))
print(f)

nn <- neuralnet(f, data=df, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron

# The information that is printed will be output into risk-predication-model-training-report.txt
print(nn)

#saveRDS(nn, "./Model/riskPredictionModel_exp1.rds")
saveRDS(nn, "./Model/riskPredictionModel_open_source.rds")

plot(nn)



sink()