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

elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
outputDir <- args[3]
workDir <- args[4]
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset

elementData <- read.csv(elementStatisticsPath, header=TRUE)
pathData <- read.csv(pathStatisticsPath, header=TRUE)
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
ioPathData = pathData[pathData$transactonal == "validation or interface management",][,5]
if(length(ioPathData) == 0 || is.na(ioPathData)){
	ioPathData = c(0);
}
ioPathData = as.numeric(ioPathData)

dmPathData = pathData[pathData$transactional == "data management",][,5]
if(length(dmPathData) == 0 || is.na(dmPathData)){
	dmPathData = c(0);
}
dmPathData = as.numeric(dmPathData)

coPathData = pathData[pathData$transactional == "Invocation of services provided by external system",][,5]
if(length(coPathData) == 0 || is.na(coPathData)){
	coPathData = c(0);
}
coPathData = as.numeric(coPathData)

pmPathData = pathData[pathData$transactional == "partially matched transactional pattern",][,5]
if(length(pmPathData) == 0 || is.na(pmPathData)){
	pmPathData = c(0);
}
pmPathData = as.numeric(pmPathData)

svg(paste(outputDir,"interface_operation_analysis_result.svg", sep="/"))
print(hist(ioPathData, main="Inteface Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"data_operation_analysis_result.svg", sep="/"))
print(hist(dmPathData, main="Data Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"control_operation_analysis_result.svg", sep="/"))
print(hist(coPathData, main="Control Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"partial_match_analysis_result.svg", sep="/"))
print(hist(pmPathData, main="Partially Matched Num", xlab="Path Length", breaks=15))


transactionalPatternCounts <- table(pathData$transactional)
if(length(transactionalPatternCounts) == 0){
	transactionalPatternCounts <- matrix(c(0,0),
			nrow=1, 
			ncol=1)
	
}
functionalPatternCounts <- table(pathData$functional)
if(length(functionalPatternCounts) == 0){
	functionalPatternCounts <- matrix(c(0,0),
			nrow=1, 
			ncol=1)
	
}

svg(paste(outputDir,"trasactional_pattern_counts.svg", sep="/"))
print(barplot(transactionalPatternCounts, main="Transactional Pattern Counts", xlab="Transactional Patterns"))
svg(paste(outputDir,"functional_pattern_counts.svg", sep="/"))
print(barplot(functionalPatternCounts, main="Functional Pattern Counts", xlab="Functional Patterns"))

#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
