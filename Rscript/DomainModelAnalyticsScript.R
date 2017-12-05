#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: attribute staitstics file path
# arg3: operation statistics file path
# arg4: output dir
# arg5: working directory

if (length(args) < 3) {
	stop("At least two argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==3) {
	# default output file
	args[4] = "."
	args[5] = "."
} else if(length(args) == 4){
	args[5] = "."
}

elementStatisticsPath = args[1]
attributeStatisticsPath = args[2]
operationStatisticsPath = args[3]
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
attributeData <- read.csv(attributeStatisticsPath, header=TRUE)
operationData <- read.csv(operationStatisticsPath, header=TRUE)
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
operationNumData = elementData[,4]
if(length(operationNumData) == 0 || is.na(operationNumData)){
	operationNumData = c(0);
}
operationNumData = as.numeric(operationNumData)

attributeNumData = elementData[,3]
if(length(attributeNumData) == 0 || is.na(attributeNumData)){
	attributeNumData = c(0);
}
attributeNumData = as.numeric(attributeNumData)


svg(paste(outputDir,"operation_num_analysis_result.svg", sep="/"))
print(hist(operationNumData, main="Operation Num", xlab="Operation Num", breaks=15))
svg(paste(outputDir,"attribute_num_analysis_result.svg", sep="/"))
print(hist(attributeNumData, main="Attribute Num", xlab="Attribute Length", breaks=15))
#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
