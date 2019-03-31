#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: model version info file path
# arg2: output dir
# arg3: working directory

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "."
	args[3] = '.'
} else if (length(args) == 2){
	args[3] = '.'
}

modelVersionInfoPath <- args[1]
outputDir <- args[2]
workDir <- args[3]
reportPath <- paste(outputDir,'model_version_analysis_report.txt', sep='/')
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
sink(reportPath)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset
library(ggplot2)
library(data.table)
modelVersionInfo=read.csv(modelVersionInfoPath,header=TRUE)
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

#draw trending line based on version info
svg(paste(outputDir,"model_version_trending_lines.svg",sep="/"), width=12, height=3)
print("model version info")
print(modelVersionInfo)
print(ggplot(modelVersionInfo,aes(x=update_time,group=1))+geom_line(aes(y=number_of_paths))+ggtitle("Number of Transactions"))


#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
