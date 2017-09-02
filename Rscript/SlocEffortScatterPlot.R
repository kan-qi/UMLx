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
library(lattice)
# set the output file
# sink(args[2])
# load the dataset

slocEffortUrl <- args[1];
slocEffortData <- read.delim(slocEffortUrl)
# cat(slocEffortData[0])
# result <- str(slocEffortData)
# cat(result)

#setwd("")
print(xyplot(effort ~ sloc, slocEffortData, grid = TRUE))
#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
