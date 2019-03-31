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
reportPath <- paste(outputPath,'use-case-point-accuracy-analysis-report.txt', sep='/')

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
library(gplots)
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

yrange = c(0.15, 0.7)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Number of Data Points",
		ylab="PRED(.15)" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)
plotchar <- c(18,18,18,18)
#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	print(i)
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P15, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[1])
	
	sub_data_set$P15_CI_upper = sub_data_set$P15+sub_data_set$P15_std/2;
	sub_data_set$P15_CI_lower = sub_data_set$P15-sub_data_set$P15_std/2;
	
	for(j in 1: length(sub_data_set$Data_Points)){
		
		lines(c(sub_data_set$Data_Points[j],sub_data_set$Data_Points[j]), c(sub_data_set$P15_CI_upper[j],sub_data_set$P15_CI_lower[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$P15_CI_upper[j],sub_data_set$P15_CI_upper[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$P15_CI_lower[j],sub_data_set$P15_CI_lower[j]), col=colors[i])
	}
	
	#plotCI(x=sub_data_set$Data_Points, y=sub_data_set$P15, uiw=sub_data_set$P15_std, liw=sub_data_set$P15_std, col=colors[i])
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$P15)
#} 
}

# add a title and subtitle 
title("PRED(.15) over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=1.0, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

#PRED(0.25)
png(filename=paste(outputPath,'accuracy_evaluation_plot_25.png', sep='/'),
		type="cairo",
		units="in", 
		width=2.5*2, 
		height=2.5*2,
		res=96)

yrange = c(0.25, 0.8)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Number of Data Points",
		ylab="PRED(.25)" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)
plotchar <- c(18,18,18,18)
#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P25, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[1]) 
	
	
	sub_data_set$P25_CI_upper = sub_data_set$P25+sub_data_set$P25_std/2;
	sub_data_set$P25_CI_lower = sub_data_set$P25-sub_data_set$P25_std/2;
	
	#plotCI(x=sub_data_set$Data_Points, y=sub_data_set$P25, uiw=sub_data_set$P25_std, liw=sub_data_set$P25_std, col=colors[i])
	
	for(j in 1: length(sub_data_set$Data_Points)){
		
		lines(c(sub_data_set$Data_Points[j],sub_data_set$Data_Points[j]), c(sub_data_set$P25_CI_upper[j],sub_data_set$P25_CI_lower[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$P25_CI_upper[j],sub_data_set$P25_CI_upper[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$P25_CI_lower[j],sub_data_set$P25_CI_lower[j]), col=colors[i])
	}
	
	
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

yrange = c(0.4, 1.2)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Number of Data Points",
		ylab="PRED(.50)" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)

plotchar <- c(18,18,18,18)
#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$P50, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[1]) 
	
	
	sub_data_set$P50_CI_upper = sub_data_set$P50+sub_data_set$P50_std/2;
	sub_data_set$P50_CI_lower = sub_data_set$P50-sub_data_set$P50_std/2;
	
	#plotCI(x=sub_data_set$Data_Points, y=sub_data_set$P50, uiw=sub_data_set$P50_std, liw=sub_data_set$P50_std, col=colors[i])
	
	for(j in 1: length(sub_data_set$Data_Points)){
		
		lines(c(sub_data_set$Data_Points[j],sub_data_set$Data_Points[j]), c(sub_data_set$P50_CI_upper[j],sub_data_set$P50_CI_lower[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$P50_CI_upper[j],sub_data_set$P50_CI_upper[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$P50_CI_lower[j],sub_data_set$P50_CI_lower[j]), col=colors[i])
	}
	
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

yrange = c(0.1, 2.3)

# set up the plot 
plot(xrange, yrange, type="n", xlab="Number of Data Points",
		ylab="MMRE" ) 
#colors <- rainbow(nDataSets) 
colors <- rainbow(nEstimators)
#v <- c(7,12,28,3,41)
linetype <- c(1:nEstimators) 
plotchar <- seq(18,18+nEstimators,1)
plotchar <- c(18,18,18,18)
#plot(v,type = "o",col = "red", xlab = "Month", ylab = "Rain fall", 
#		main = "Rain fall chart")

for(i in 1:nEstimators){
# add lines 
#for (K in 1:nDataSets) { 
	
	sub_data_set <- subset(accuracyData, accuracyData$Estimator==i) 
	print(sub_data_set)
	lines(sub_data_set$Data_Points, sub_data_set$M, type="b", lwd=1.5,
			lty=linetype[i], col=colors[i], pch=plotchar[1])
	
	
	sub_data_set$M_CI_upper = sub_data_set$M+sub_data_set$M_std/2;
	sub_data_set$M_CI_lower = sub_data_set$M-sub_data_set$M_std/2;

	#plotCI(x=sub_data_set$Data_Points, y=sub_data_set$M, uiw=sub_data_set$M_std, liw=sub_data_set$M_std, col=colors[i])
	
	for(j in 1: length(sub_data_set$Data_Points)){
		
		lines(c(sub_data_set$Data_Points[j],sub_data_set$Data_Points[j]), c(sub_data_set$M_CI_upper[j],sub_data_set$M_CI_lower[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$M_CI_upper[j],sub_data_set$M_CI_upper[j]), col=colors[i])
		
		lines(c(sub_data_set$Data_Points[j]-1,sub_data_set$Data_Points[j]+1), c(sub_data_set$M_CI_lower[j],sub_data_set$M_CI_lower[j]), col=colors[i])
	}
	
	print(sub_data_set$Data_Points)
	print(sub_data_set$M)
#} 
}

# add a title and subtitle 
title("MMRE over D1, D2, and D3")

# add a legend 
legend(xrange[1], yrange[2], c("Bayesian", "A-Priori", "Original", "Regression"), cex=0.8, col=colors,
		pch=plotchar, lty=linetype, title="Estimator")

# to calculate the t values for the accuracy assessment
for (i in 1:nDataSets) { 
	print(i)
	sub_data_set <- subset(accuracyData, accuracyData$Data_Set==i) 
	print(sub_data_set)
	print("pair-by-part t test")
	
	for(j in 1:nEstimators){
		for(k in 1:nEstimators){
			estimator1 = sub_data_set[j,]
			estimator2 = sub_data_set[k,]
			print(paste("two sample t test:",estimator1$Estimator_Label, "over", estimator2$Estimator_Label))
			tResults = c((estimator1$M-estimator2$M)/sqrt(estimator1$M_std^2/10+estimator2$M_std^2/10))
			tResults = c(tResults, (estimator1$P15-estimator2$P15)/sqrt(estimator1$P15_std^2/10+estimator2$P15_std^2/10))
			tResults = c(tResults, (estimator1$P25-estimator2$P25)/sqrt(estimator1$P25_std^2/10+estimator2$P25_std^2/10))
			tResults = c(tResults, (estimator1$P50-estimator2$P50)/sqrt(estimator1$P50_std^2/10+estimator2$P50_std^2/10))
			print("m, p15, p25, p50")
			print(tResults);
		}
	}
	
}

#also have linear regression on sloc and normalized effort.
sink()

