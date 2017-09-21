#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: use case evaluation file path
# arg2: model evaluation file path
# arg3: output dir
# arg4: working directory

if (length(args) < 2) {
	stop("At least two argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
}

useCaseEvaluationPath = args[1]
modelEvaluationPath = args[2]
outputDir <- args[3]
#workDir <- args[4]
# store the current directory
#initial.dir<-getwd()
#setwd(workDir)

reportPath <- paste(outputDir,'repo_discriptive_analysis_report.txt', sep='/')

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries
library(lattice)
library(latticeExtra)
# set the output file
library(reshape)
#library(dplyr)

sink(reportPath)

useCaseEvaluationData <- read.csv(useCaseEvaluationPath , header=TRUE)
modelEvaluationData <- read.csv(modelEvaluationPath, header=TRUE)

projectDescriptiveData <- modelEvaluationData[c("NUM", "Effort", "KSLOC", "UseCase_Num")]

#transactionalDataMelt <- gather(transactionalData, key=variable, value=value, EUCP_ALY, EXUCP_ALY, DUCP_ALY)
projectDescriptiveDataMelt <- melt(projectDescriptiveData, id=c("NUM"))

print(projectDescriptiveDataMelt)

#svg(paste(outputDir,"project_discriptive_statistics.svg", sep="/"))
png(filename=paste(outputDir,"project_discriptive_statistics.png", sep="/"),
		units="in",
		width=4*2, 
		height=4*2, 
		pointsize=12,
		res=96)
projectHist = histogram(~ value | variable,
		main="Project Descriptive Statistics", 
		ylab="Frequency",
		xlab="",
		strip =strip.custom(factor.levels = c("Effort(PH)","KSLOC","Number of Use Cases")),
		freq=TRUE,
		breaks=15,
		scales=list(x=list(relation="free")),
		data=projectDescriptiveDataMelt)
print(projectHist)


# dump distributions of the project analytical data
projectAnalyticalData <- modelEvaluationData[c("NUM", "UEUCW_ALY", "UEXUCW_ALY", "UDUCW_ALY", "UAW", "TCF", "EF",  "EUCP_ALY", "EXUCP_ALY", "DUCP_ALY", "Effort_Norm_UCP")]

#transactionalDataMelt <- gather(transactionalData, key=variable, value=value, EUCP_ALY, EXUCP_ALY, DUCP_ALY)
projectAnalyticalDataMelt <- melt(projectAnalyticalData, id=c("NUM"))

print(projectAnalyticalDataMelt)

#svg(paste(outputDir,"project_discriptive_statistics.svg", sep="/"))
png(filename=paste(outputDir,"project_analytical_data_discriptive_statistics.png", sep="/"),
		units="in",
		width=4*5, 
		height=4*2, 
		pointsize=12,
		res=96)
projectAnalyticHist = histogram(~ value | variable,
		main="Project Analytical Statistics", 
		ylab="Frequency",
		xlab="",
		strip =strip.custom(factor.levels = c("UEUCW",  "UEXUCW", "UDCW", "UAW", "TCF", "EF", "EUCP", "EXUCP", "DUCP", "Effort Norm")),
		freq=TRUE,
		breaks=15,
		cex=1.5,
		scales=list(x=list(relation="free")),
		data=projectAnalyticalDataMelt)
print(projectAnalyticHist)


sink()
#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
#setwd(initial.dir)
