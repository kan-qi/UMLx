#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

if (length(args)==0) {
  stop("At least one argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==1) {
  # default output file
  args[2] = ".\\tools\\temp"
}

workDir <- args[1]
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file
pdf(".\\uml_analysis_result.pdf")
# load the dataset

umlData <- read.csv(".\\umlAnalysisResult\\statistics.csv", header=TRUE)
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
avgDegreeData = as.numeric(umlData[, 2]);
avgPathData = as.numeric(umlData[, 3]);
arcDiffData = as.numeric(umlData[, 4]);
pathNumData = as.numeric(umlData[, 5]);
interfaceOpNumData = as.numeric(umlData[, 6]);
dataOpNumData = as.numeric(umlData[, 7]);
controlOpNumData = as.numeric(umlData[, 8]);
partialMatchedNumData = as.numeric(umlData[, 9]);

print(hist(avgDegreeData, main="Average Degree", xlab="avg degree", breaks=15))
print(hist(avgPathData, main="Average Path Length", xlab="avg path", breaks=15))
print(hist(arcDiffData, main="architechture difficulty", xlab="arc difficulty", breaks=15))
print(hist(pathNumData, main="Path Number", xlab="path number", breaks=15))
print(hist(interfaceOpNumData, main="Inteface Operation Num", xlab="interface operation", breaks=15))
print(hist(dataOpNumData, main="Data Operation Num", xlab="data operation", breaks=15))
print(hist(controlOpNumData, main="Control Operation Number", xlab="control operation", breaks=15))
print(hist(partialMatchedNumData, main="Partially Matched Number", xlab="partically matched operation", breaks=15))


#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
