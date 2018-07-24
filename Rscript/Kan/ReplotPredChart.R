#!/usr/bin/env Rscript

#arg1: data url
#arg2: a priori use case and actor weights
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath <- paste(outputPath,'pred-plot-report.txt', sep='/')
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

avgPreds <- read.csv(dataUrl, header=TRUE)

print(avgPreds)

print('average improvement over a priori')
print(mean(avgPreds[, "Bayesian"] - avgPreds[,"A_Priori"]))
print('average improvement over original')
print(mean(avgPreds[, "Bayesian"] - avgPreds[,"Original"]))
print('average improvement over regression')
print(mean(avgPreds[, "Bayesian"] - avgPreds[,"Regression"]))


print('average improvement by Bayesian')
print(colMeans(avgPreds[, "Bayesian"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by A Priori')
print(colMeans(avgPreds[, "A_Priori"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by Original')
print(colMeans(avgPreds[, "Original"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by Regression')
print(colMeans(avgPreds[, "Regression"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))

meltAvgPreds = melt(avgPreds, id.vars="Pred", value.name="Value", variable.name="Method")

print("melt avg preds info")
print(meltAvgPreds)
svg(paste(outputPath,"use_case_weight_calibration_err_plot_pred_50.svg", sep="/"), width=2, height=4)
ggplot(meltAvgPreds) + theme_bw() + 
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method),size=3)+ xlab("Relative Deviation (x%)") +
		ylab("Percentage of Estimates <= x%")+ theme(legend.position="bottom")

print("melt avg preds info as lines and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_lines_smooth_pred_50.svg", sep="/"), width=2, height=4)
ggplot(meltAvgPreds) +theme_bw()+
		geom_line(aes(y=Value, x=Pred, group=Method,color=Method)) +
		stat_smooth(aes(y=Value, x=Pred, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (x%)") +
		ylab("Percentage of Estimates <= x%")+ theme(legend.position="bottom")

print("melt avg preds info as dots and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_dots_smooth_pred_50.svg", sep="/"), width=2.5, height=4)
ggplot(meltAvgPreds) +theme_bw()+
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method,shape=Method),size=1.5) +
		scale_shape_manual(values=c(0,1,2,3))+
		stat_smooth(aes(x=Pred, y=Value, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (x%)") +
		ylab("Percentage of Estimates <= x%")+ theme(legend.position="bottom")

#also have linear regression on sloc and normalized effort.
sink()

