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
reportPath <- paste(outputPath,'effort-predication-model-training-report.txt', sep='/')

library(lattice)
library(ggplot2)
library(neuralnet)

sink(reportPath)

df <- read.csv(dataUrl, header=TRUE, sep=",")
names <- colnames(df)
print('names')
print(names);

factors <- c()

#print(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~"))
#f <- as.formula(paste("RISK1+RISK2+RISK3+RISK4+RISK5~", paste(names[!names %in% "RISK*"], collapse= "+"))) #making a formula to fit to neural net
f <- as.formula(paste("Effort", paste(names[!names %in% factors], collapse= "+"), sep="~")) #making a formula to fit to neural net
print((names[!names %in% factors]))
print(f)

nn <- neuralnet(f, data=df, hidden=3, linear.output=T) #model with one hidden layer and one neuron

print(nn)

saveRDS(nn, "./Model/neural_network_effort_estimation.rds")

plot(nn)



sink()