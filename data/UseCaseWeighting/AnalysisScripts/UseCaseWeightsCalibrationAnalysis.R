#!/usr/bin/env Rscript

#arg1: accuracy evaluation url
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least 2 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath <- paste(outputPath,'use-case-point-weight-analysis-report.txt', sep='/')

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
library(data.table)
library(gridExtra)

sink(reportPath)

accuracyData <- read.csv(dataUrl, header=TRUE)
#accuracyData <- accuracydata[c("Data_Set", "Data_Point", "Estimator", "M.", "P.(.15)", "P.(.25)", "P.(.50)", "P_AVG")]

# Create Line Chart

# convert factor to numeric for convenience 
accuracyData$Data_Set <- as.numeric(accuracyData$Data_Set)
#accuracyData$Estimator_Labels <- accuracyData$Estimator
accuracyData$Estimator <- as.numeric(accuracyData$Estimator)

print("transformed data")
print(accuracyData)
#print(accuracyData$Data_Set)
nDataSets <- max(accuracyData$Data_Set)
nEstimators <- max(accuracyData$Estimator)
print(nEstimators);
# get the range for the x and y axis 
xrange <- range(accuracyData$Data_Points)
yrange <- range(accuracyData$P25) 


#PRED(0.15)
png(filename=paste(outputPath,'accuracy_evaluation_plot_PRED_15.png', sep='/'),
		type="cairo",
		units="in", 
		width=2.5*2, 
		height=2.5*2,
		res=96)

yrange = c(0.15, 0.65)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Data Points",
		ylab="PRED(.15)" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)

#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	print(i)
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P15, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[i]) 
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$P15)
#} 
}

# add a title and subtitle 
title("PRED(.15) over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=0.8, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

#PRED(0.25)
png(filename=paste(outputPath,'accuracy_evaluation_plot_25.png', sep='/'),
		type="cairo",
		units="in", 
		width=2.5*2, 
		height=2.5*2,
		res=96)

yrange = c(0.25, 0.7)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Data Points",
		ylab="PRED(.25)" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)

#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P25, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[i]) 
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$P25)
#} 
}

# add a title and subtitle 
title("PRED(.25) over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=0.8, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

#PRED(0.50)
png(filename=paste(outputPath,'accuracy_evaluation_plot_50.png', sep='/'),
		type="cairo",
		units="in", 
		width=2.5*2, 
		height=2.5*2,
		res=96)

yrange = c(0.45, 1.1)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Data Points",
		ylab="PRED(.50)" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)

#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P50, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[i]) 
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$P50)
#} 
}

# add a title and subtitle 
title("PRED(.50) over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=0.8, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

#mmre
png(filename=paste(outputPath,'accuracy_evaluation_plot_mmre.png', sep='/'),
		type="cairo",
		units="in", 
		width=2.5*2, 
		height=2.5*2,
		res=96)

yrange = c(0.1, 1.9)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Data Points",
		ylab="MMRE" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)

#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$M, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[i]) 
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$M)
#} 
}

# add a title and subtitle 
title("MMRE over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=0.8, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

#avg
png(filename=paste(outputPath,'accuracy_evaluation_plot_avg.png', sep='/'),
		type="cairo",
		units="in", 
		width=2.5*2, 
		height=2.5*2,
		res=96)

yrange = c(0.1, 0.7)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Data Points",
		ylab="PRED_AVG" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)

#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P_AVG, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[i]) 
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$P_AVG)
#} 
}

# add a title and subtitle 
title("PRED_AVG over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=0.8, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

#also have linear regression on sloc and normalized effort.
sink()

