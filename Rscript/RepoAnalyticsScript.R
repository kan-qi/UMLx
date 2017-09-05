#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: path staitstics file path
# arg3: expanded path statistics file path
# arg4: diagram statistics file path
# arg5: output dir
# arg6: working directory

if (length(args) < 4) {
	stop("At least four argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==4) {
	# default output file
	args[5] = "."
	args[6] = '.'
} else if (length(args) == 5){
	args[6] = '.'
}

elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
expandedPathStatisticsPath = args[3]
usecaseStatisticsPath = args[4]
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
expandedPathData <- read.csv(expandedPathStatisticsPath, header=TRUE)
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
intPathData = expandedPathData[expandedPathData$transactional == "INT", ]$path_length
if(length(intPathData) == 0 || is.na(intPathData)){
	intPathData = c(0);
}
intPathData = as.numeric(intPathData)

ctrlPathData = expandedPathData[expandedPathData$transactional == "CTRL",]$path_length
if(length(ctrlPathData) == 0 || is.na(ctrlPathData)){
	ctrlPathData = c(0);
}
ctrlPathData = as.numeric(ctrlPathData)

eiPathData = expandedPathData[expandedPathData$transactional == "EI",]$path_length
if(length(eiPathData) == 0 || is.na(eiPathData)){
	eiPathData = c(0);
}
eiPathData = as.numeric(eiPathData)

eqPathData = expandedPathData[expandedPathData$transactional == "EQ",]$path_length
if(length(eqPathData) == 0 || is.na(eqPathData)){
	eqPathData = c(0);
}
eqPathData = as.numeric(eqPathData)

extivkPathData = expandedPathData[expandedPathData$transactional == "EXTIVK",]$path_length
if(length(extivkPathData) == 0 || is.na(extivkPathData)){
	extivkPathData = c(0);
}
extivkPathData = as.numeric(extivkPathData)

extcllPathData = expandedPathData[expandedPathData$transactional == "EXTCLL",]$path_length
if(length(extcllPathData) == 0 || is.na(extcllPathData)){
	extcllPathData = c(0);
}
extcllPathData = as.numeric(extcllPathData)

naPathData = expandedPathData[expandedPathData$transactional == "TRAN_NA",]$path_length
if(length(naPathData) == 0 || is.na(naPathData)){
	naPathData = c(0);
}
naPathData = as.numeric(naPathData)

svg(paste(outputDir,"interface_operation_analysis_result.svg", sep="/"))
print(hist(intPathData, main="Inteface Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"control_operation_analysis_result.svg", sep="/"))
print(hist(ctrlPathData, main="Control Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_input_operation_analysis_result.svg", sep="/"))
print(hist(eiPathData, main="External Input Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_query_operation_analysis_result.svg", sep="/"))
print(hist(eqPathData, main="External Query Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_invocation_operation_analysis_result.svg", sep="/"))
print(hist(extivkPathData, main="External Invocation Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_call_operation_analysis_result.svg", sep="/"))
print(hist(extcllPathData, main="External Call Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"not_matched_analysis_result.svg", sep="/"))
print(hist(naPathData, main="Not Matched Operation Num", xlab="Path Length", breaks=15))



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
