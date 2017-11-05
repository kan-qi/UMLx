#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: entity analytics file path
# arg2: attribute analytics file path
# arg3: operation analytics file path
# arg4: element analytics file path
# arg5: path analytics file path
# arg6: output dir
# arg7: working directory

if (length(args) < 5) {
	stop("At least five argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==5) {
	# default output file
	args[6] = "."
	args[7] = "."
} else if(length(args) == 6){
	args[7] = "."
}

entityAnalyticsPath = args[1]
attributeAnalyticsPath = args[2]
operationAnalyticsPath = args[3]
elementAnalyticsPath = args[4]
pathAnalyticsPath = args[5]
outputDir <- args[6]
workDir <- args[7]
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

entityData <- read.csv(entityAnalyticsPath, header=TRUE)
attributeData <- read.csv(attributeAnalyticsPath, header=TRUE)
operationData <- read.csv(operationAnalyticsPath, header=TRUE)
elementData <- read.csv(elementAnalyticsPath, header=TRUE)
pathData <- read.csv(pathAnalyticsPath, header=TRUE)
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
