#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: path staitstics file path
# arg3: use case statistics file path
# arg4: domain model statistics file path
# arg5: output dir
# arg6: working directory

if (length(args) < 4) {
	stop("At least three argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==4) {
	# default output file
	args[5] = "."
	args[6] = '.'
} else if (length(args) == 5){
	args[6] = '.'
}

elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
usecaseStatisticsPath = args[3]
domainModelStatisticsPath = args[4]
outputDir <- args[5]
workDir <- args[6]
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
usecaseData <- read.csv(usecaseStatisticsPath, header=TRUE)
domainModelData <- read.csv(domainModelStatisticsPath, header=TRUE)
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
ioPathData = pathData[pathData$transactional == "validation or interface management",][,5]
if(length(ioPathData) == 0){
	ioPathData = c(0);
}
ioPathData = as.numeric(ioPathData)

dmPathData = pathData[pathData$transactional == "data management",][,5]
if(length(dmPathData) == 0){
	dmPathData = c(0);
}
dmPathData = as.numeric(dmPathData)

coPathData = pathData[pathData$transactional == "Invocation of services provided by external system",][,5]
if(length(coPathData) == 0){
	coPathData = c(0);
}
coPathData = as.numeric(coPathData)

pmPathData = pathData[pathData$transactional == "partially matched transactional pattern",][,5]
if(length(pmPathData) == 0){
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


#usecase statistics
usecaseDataCol13 = usecaseData[,13]
if(length(usecaseDataCol13) == 0){
	usecaseDataCol13 = c(0);
}
usecaseDataCol13 = as.numeric(usecaseDataCol13)

usecaseDataCol14 =  usecaseData[,14]
if(length(usecaseDataCol14) == 0){
	usecaseDataCol14 = c(0);
}
usecaseDataCol14 = as.numeric(usecaseDataCol14)

usecaseDataCol15 =  usecaseData[,15]
if(length(usecaseDataCol15) == 0){
	usecaseDataCol15 = c(0);
}
usecaseDataCol15 = as.numeric(usecaseDataCol15)

usecaseDataCol16 =  usecaseData[,16]
if(length(usecaseDataCol16) == 0){
	usecaseDataCol16 = c(0);
}
usecaseDataCol16 = as.numeric(usecaseDataCol16)

svg(paste(outputDir,"average_degree_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol13, main="Average Degree", xlab="Average Degree", breaks=15))
svg(paste(outputDir,"average_path_length_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol14, main="Average Path Length", xlab="Average Path Length", breaks=15))
svg(paste(outputDir,"architecture_difficulty_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol15, main="Architecture Difficulty", xlab="Architecture Difficulty", breaks=15))
svg(paste(outputDir,"path_number_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol16, main="Path Number", xlab="Path Number", breaks=15))


#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
