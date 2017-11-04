#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: path staitstics file path
# arg3: output dir
# arg4: working directory

if (length(args) < 2) {
	stop("At least two argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "."
	args[4] = "."
} else if(length(args) == 3){
	args[4] = "."
}

elementAnalyticsPath = args[1]
pathAnalyticsPath = args[2]
outputDir <- args[3]
workDir <- args[4]
reportPath <- paste(outputDir, 'report.txt', sep='/')
# store the current directory
initial.dir<-getwd()
setwd(workDir)

sink(reportPath)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset

elementData <- read.csv(elementAnalyticsPath, header=TRUE)
pathData <- read.csv(pathAnalyticsPath, header=TRUE)
#expandedPathData <- read.csv(expandedPathAnalyticsPath, header=TRUE)
# cat(slocEffortData[0])
# result <- str(slocEffortData)
# cat(result)
# head(umlData[, 4])

# main="Histogram for Air Passengers",
#      xlab="Passengers",
#      border="blue",
#      col="green",
#      xlim=c(100,700),
#      las=1,
#      breaks=5

#setwd("")
#usecase statistics


sink()

#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
