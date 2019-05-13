#!/usr/bin/env Rscript

#arg1: data url
#arg2: a priori use case and actor weights
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least 2 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
}

dataUrl <- args[1]
apriori <- args[2]
outputPath <- args[3]
reportPath <- paste(outputPath,'use-case-point-weight-calibration-report.txt', sep='/')
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


useCaseData <- read.csv(dataUrl, header=TRUE)
aprioriData <- read.csv(apriori, header=TRUE)

#output the project descriptive data for number valued data
projectDescriptiveNumberData <- useCaseData[c("Project_No", "Real_Effort_Person_Hours", "KSLOC", "Use_Case_Num")]
projectDescriptiveNumberDataMelt <- melt(projectDescriptiveNumberData, id=c("Project_No"))
levels(projectDescriptiveNumberDataMelt$variable) <- c("Effort (person-hours)", "KSLOC", "Use Case Num")

print(projectDescriptiveNumberDataMelt)

#svg(paste(outputPath,"project_discriptive_statistics.svg", sep="/"))
png(filename=paste(outputPath,"project_discriptive_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=4*2, 
		pointsize=12,
		res=96)

projectHist1 <- ggplot(useCaseData, aes(x=Real_Effort_Person_Hours))+geom_histogram(binwidth=100, colour="black", fill="white")+xlab("Effort (person-hours)")+ylab("Count")
projectHist2 <- ggplot(useCaseData, aes(x=KSLOC))+geom_histogram(binwidth=2, colour="black", fill="white")+xlab("KSLOC")+ylab("Count")
projectHist3 <- ggplot(useCaseData, aes(x=Use_Case_Num))+geom_histogram(binwidth=2, colour="black", fill="white")+xlab("Use Case Num")+ylab("Count")
projectBar <- ggplot(useCaseData, aes(Application_Type))+geom_bar(colour="black", fill="white")+xlab("Application Type")+ylab("Count")
print(grid.arrange(projectHist1, projectHist2, projectHist3, projectBar, ncol=2))

#output the project descriptive data for categorical valued data
projectDescriptiveCatData <- useCaseData[c("Project_No", "Application_Type")]
projectDescriptiveCatDataMelt <- melt(projectDescriptiveCatData, id=c("Project_No"))


print(projectDescriptiveCatDataMelt)

#svg(paste(outputPath,"project_categorical_valued__discriptive_statistics.svg", sep="/"))
png(filename=paste(outputPath,"project_categorical_valued_discriptive_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*1, 
		height=4*1, 
		pointsize=12,
		res=96)
projectBarchart = barchart(Project_No ~ value | variable, data = projectDescriptiveCatDataMelt,
		groups = variable, 
		ylab = "Number",
		scales = list(x = list(abbreviate = TRUE,
						minlength = 5)))
print(projectBarchart)


sink()

