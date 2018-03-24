#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

if (length(args)==0) {
  stop("At least one argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==1) {
  # default output file
  args[2] = ".\\tools\\temp"
}

workDir <- args[2]
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries
library(BMA)
library(MASS)
# set the output file
sink("bayesian_average_report.txt")
# pdf("bayesian_model_average_result.pdf") 
# load the dataset

resDataUrl <- args[1];
resData <- read.table(file = resDataUrl, header=TRUE)
x.resData <- resData[,-5]
# x.resData <- x.resData[,-5]
x.resData <- x.resData[,-1]
y.resData <- resData[,5]

print("x:")
print(x.resData)
print("y:")
print(y.resData)

resData.bicreg <- bicreg(x.resData, y.resData)

# cat(EUCPEffortData)
# result <- str(slocEffortData)
# cat(result)

#setwd("")
#plot EUCP linear regression
# capture.output(print(summary(~ x + y), prmsd=TRUE, digits=1), file="out.txt")
summary(resData.bicreg, digits=2)
# out <- capture.output(print(summary(resData.bicreg, digits=2)))
# cat("hello", out, file="C:\\Users\\flyqk\\Documents\\Research Workspace\\Repo Analyser\\tools\\Projects\\ResilientAgileSrcCount\\tempoutput.txt", append=TRUE)
#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)