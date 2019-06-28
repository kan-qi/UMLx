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
# sink("normalized_regression_plot.pdf")
pdf("normalized_regression_plot.pdf") 
# load the dataset

effortDataFolderUrl <- args[1];
EUCPEffortData <- read.delim(file = paste(effortDataFolderUrl, "\\EUCPEffortData.txt", sep=""))
EXUCPEffortData <- read.delim(file = paste(effortDataFolderUrl, "\\EXUCPEffortData.txt", sep=""))
AFPCEffortData <- read.delim(file = paste(effortDataFolderUrl, "\\AFPCEffortData.txt", sep=""))
# cat(EUCPEffortData)
# result <- str(slocEffortData)
# cat(result)

#setwd("")
#plot EUCP linear regression
print(xyplot(Effort ~ EUCPW, EUCPEffortData,
       grid = TRUE,
      # scales = list(x = list(log = 10, equispaced.log = FALSE)),
       group = Type, auto.key = TRUE,
       type = c("p", "r"), lwd = 4))
print(xyplot(Effort ~ EXUCPW, EXUCPEffortData,
       grid = TRUE,
#      scales = list(x = list(log = 10, equispaced.log = FALSE)),
       group = Type, auto.key = TRUE,
       type = c("p", "r"), lwd = 4))
print(xyplot(Effort ~ AFPC, AFPCEffortData,
       grid = TRUE,
#       scales = list(x = list(log = 10, equispaced.log = FALSE)),
       group = Type, auto.key = TRUE,
       type = c("p", "r"), lwd = 4))
#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)