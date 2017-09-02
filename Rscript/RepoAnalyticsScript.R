#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: path staitstics file path
# arg3: diagram statistics file path
# arg4: output dir
# arg5: working directory

if (length(args) < 3) {
	stop("At least three argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==3) {
	# default output file
	args[4] = "."
	args[5] = '.'
} else if (length(args) == 4){
	args[5] = '.'
}

elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
usecaseStatisticsPath = args[3]
outputDir <- args[4]
workDir <- args[5]
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



transactionArchDiffData = pathData[c('arch_diff')]
if(length(transactionArchDiffData) == 0){
	transactionArchDiffData = c(0);
}
transactionArchDiffData = as.numeric(transactionArchDiffData)

transactionLengthData = pathData[c('path_length')]
if(length(transactionLengthData) == 0){
	transactionLengthData = c(0);
}

svg(paste(outputDir,"transaction_arch_diff_analysis_result.svg", sep="/"))
print(hist(transactionArchDiffData, main="Transaction Architecture Difficulty", xlab="Transaction Arch Diff", breaks=15))

svg(paste(outputDir,"transaction_length_analysis_result.svg", sep="/"))
print(hist(transactionLengthData, main="Transaction Length", xlab="Transaction Length", breaks=15))


#diagram statistics

usecaseDataCol3 = pathData[,3]
if(length(usecaseDataCol3) == 0){
	usecaseDataCol3 = c(0);
}
usecaseDataCol3 = as.numeric(usecaseDataCol3)

usecaseDataCol4 = pathData[,4]
if(length(usecaseDataCol4) == 0){
	usecaseDataCol4 = c(0);
}
usecaseDataCol4 = as.numeric(usecaseDataCol4)

usecaseDataCol5 = pathData[,5]
if(length(usecaseDataCol5) == 0){
	usecaseDataCol5 = c(0);
}
usecaseDataCol5 = as.numeric(usecaseDataCol5)

usecaseDataCol6 = usecaseData[,6]
if(length(usecaseDataCol6) == 0){
	usecaseDataCol6 = c(0);
}
usecaseDataCol6 = as.numeric(usecaseDataCol6)

svg(paste(outputDir,"average_degree_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol3, main="Average Degree", xlab="Average Degree", breaks=15))
svg(paste(outputDir,"average_path_length_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol4, main="Average Path Length", xlab="Average Path Length", breaks=15))
svg(paste(outputDir,"architecture_difficulty_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol5, main="Architecture Difficulty", xlab="Architecture Difficulty", breaks=15))
svg(paste(outputDir,"path_number_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol6, main="Path Number", xlab="Path Number", breaks=15))


#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
