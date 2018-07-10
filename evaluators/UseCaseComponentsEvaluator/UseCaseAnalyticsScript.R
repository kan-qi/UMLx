#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: use case analytics file path
# arg3: output dir
# arg4: working directory

if (length(args) < 1) {
	stop("At least one argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "."
	args[3] = "."
} else if(length(args) == 2){
	args[3] = "."
}

useCaseAnalyticsPath = args[1]
outputDir <- args[2]
workDir <- args[3]
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

useCaseData <- read.csv(useCaseAnalyticsPath, header=TRUE)
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
#usecase analytics
avgDegree = useCaseData$Avg_Dgree
if(length(avgDegree) == 0){
	avgDegree = c(0);
}
avgDegree = as.numeric(avgDegree)

avgPathLength =  useCaseData$Avg_Path_Length
if(length(avgPathLength) == 0){
	avgPathLength = c(0);
}
avgPathLength = as.numeric(avgPathLength)

arcDiff =  useCaseData$Avg_Diff
if(length(arcDiff) == 0){
	arcDiff = c(0);
}
arcDiff = as.numeric(arcDiff)

PathNum =  useCaseData$Path_Num
if(length(PathNum) == 0){
	PathNum = c(0);
}
PathNum = as.numeric(PathNum)

svg(paste(outputDir,"average_degree_analysis_result.svg", sep="/"))
print(hist(avgDegree, main="Average Degree", xlab="Average Degree", breaks=15))
svg(paste(outputDir,"average_path_length_analysis_result.svg", sep="/"))
print(hist(avgPathLength, main="Average Path Length", xlab="Average Path Length", breaks=15))
svg(paste(outputDir,"architecture_difficulty_analysis_result.svg", sep="/"))
print(hist(arcDiff, main="Architecture Difficulty", xlab="Architecture Difficulty", breaks=15))
svg(paste(outputDir,"path_number_analysis_result.svg", sep="/"))
print(hist(PathNum, main="Path Number", xlab="Path Number", breaks=15))

sink()

#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
