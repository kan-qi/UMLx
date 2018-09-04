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
library(MASS)
library(parcor)
# set the output file
sink("effort_regression_summary.txt")

# jpeg("effort_regression_plot.jpg")
# win.metafile("effort_regression_plot.wmf")
# png("effort_regression_plot.png")
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
# pdf("eucp_effort_regression_plot.pdf")

# png("effort_regression_plot.png")
# require(gridExtra)
# pdf("foo.pdf")

# par(mfrow=c(1, 3));
# png(filename="eucp_effort_regression_plot.png", 
#     type="cairo",
#     units="in", 
#     width=3, 
#     height=3, 
#     pointsize=12, 
#     res=96)
# print(xyplot(Effort ~ EUCP, EUCPEffortData,
#        grid = TRUE,
#       # scales = list(x = list(log = 10, equispaced.log = FALSE)),
#        xlab=list(label="EUCP", fontsize=8),
#        ylab=list(label="Effort (man-hours)", fontsize=8),
#        auto.key = TRUE,
#        type = c("p", "r"), lwd = 4))
# png(file='plot2.png')
# par(mfrow= c(1, 3))

plot1 = xyplot(Effort ~ EUCP, EUCPEffortData,
       grid = TRUE,
      # scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="EUCP", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       auto.key = TRUE,
       type = c("p", "r"), lwd = 4)
# print(plot1)
print("--------------- EUCP ~ Effort -------------")
EUCP.x = EUCPEffortData[,1]
EUCP.y = EUCPEffortData[,2]
# m1.lm = lm.ridge.univariate(EUCP.x, EUCP.y, lambda = seq(0,0.1,0.001))
m1.lm = lm.ridge.univariate(EUCP.x, EUCP.y, lambda = 3:1)
summary(m1.lm)
print("--------------- End -------------")
# pdf("exucp_effort_regression_plot.pdf")
# png(filename="exucp_effort_regression_plot.png", 
#     type="cairo",
#     units="in", 
#     width=3, 
#     height=3, 
#     pointsize=12, 
#     res=96)
# print(xyplot(Effort ~ EXUCP, EXUCPEffortData,
#        grid = TRUE,
# #      scales = list(x = list(log = 10, equispaced.log = FALSE)),
#       xlab=list(label="EXUCP", fontsize=8),
#        ylab=list(label="Effort (man-hours)", fontsize=8),
#        auto.key = TRUE,
#        type = c("p", "r"), lwd = 4))
plot2 = xyplot(Effort ~ EXUCP, EXUCPEffortData,
       grid = TRUE,
#      scales = list(x = list(log = 10, equispaced.log = FALSE)),
      xlab=list(label="EXUCP", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       auto.key = TRUE,
       type = c("p", "r"), lwd = 4)
# print(plot2)
print("--------------- EXUCP ~ Effort -------------")
EXUCP.x = EXUCPEffortData[,1]
EXUCP.y = EXUCPEffortData[,2]
m2.lm = lm.ridge.univariate(EXUCP.x, EXUCP.y, lambda = 1:10)
# m2.lm = lm.ridge.univariate(EXUCP.x, EXUCP.y, lambda = seq(0,0.1,0.001))
# m2.lm = lm.ridge.univariate(Effort ~ EXUCP, data=EXUCPEffortData, lambda = seq(0,0.1,0.001))
summary(m2.lm)

# pdf("afpc_effort_regression_plot.pdf")
# png(filename="afpc_effort_regression_plot.png", 
#     type="cairo",
#     units="in", 
#     width=3, 
#     height=3, 
#     pointsize=12, 
#     res=96)
# print(xyplot(Effort ~ AFPC, AFPCEffortData,
#        grid = TRUE,
# #       scales = list(x = list(log = 10, equispaced.log = FALSE)),
#        xlab=list(label="AFPC", fontsize=8),
#        ylab=list(label="Effort (man-hours)", fontsize=8),
#        auto.key = TRUE,
#        type = c("p", "r"), lwd = 4))
plot3 = xyplot(Effort ~ AFPC, AFPCEffortData,
       grid = TRUE,
#       scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="AFPC", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       auto.key = TRUE,
       type = c("p", "r"), lwd = 4)
print("--------------- AFPC ~ Effort -------------")
# m3.lm = lm.ridge.univariate(Effort ~ AFPC, data=AFPCEffortData, lambda = seq(0,0.1,0.001))
# m3.lm = lm.ridge.univariate(Effort ~ AFPC, data=AFPCEffortData, lambda = 1:10)
# n<-100 # number of observations
# x<-rnorm(100)
# y<-rnorm(n)
# lm.ridge.univariate(x,y,lambda=0,scale=TRUE)
AFPC.x = AFPCEffortData[,1]
AFPC.y = AFPCEffortData[,2]
m3.lm = lm.ridge.univariate(AFPC.x, AFPC.y, lambda = 1:10)
# m3.lm = lm.ridge.univariate(AFPC.x, AFPC.y, lambda = seq(0,0.1,0.001))
summary(m3.lm)


# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename="effort_regression_plot.png", 
    type="cairo",
    units="in", 
    width=3*3, 
    height=3*1, 
    pointsize=10, 
    res=96)
par(mfrow=c(1,3))
print(plot1, position = c(0, 0, 0.33, 1), more = TRUE)
print(plot2, position = c(0.34, 0, 0.66, 1), more = TRUE)
print(plot3, position = c(0.67, 0, 1, 1))

dev.off()

#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)