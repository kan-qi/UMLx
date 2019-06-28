#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

if (length(args)==0) {
  stop("At least one argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==1) {
  # default output file
  args[2] = ".\\tools\\temp"
}

reportPath <- paste(args[2],"calibration_report.txt", sep='\\')
# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file
sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
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

# png("effort_regression_plog.png")
# require(gridExtra)
# pdf("foo.pdf")

# par(mfrow=c(1, 3));
# png(filename="eucp_effort_regression_plog.png", 
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


svg(paste(args[2],"eucp.svg", sep='\\'))
plot1 = xyplot(Effort ~ EUCP, EUCPEffortData,
       grid = TRUE,
      # scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="EUCP", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       auto.key = TRUE,
       type = c("p", "r"), lwd = 4)
print(plot1)
print("--------------- EUCP ~ Effort -------------")
m1.lm = lm(Effort ~ EUCP, data=EUCPEffortData)
summary(m1.lm)

# pdf("exucp_effort_regression_plot.pdf")
# png(filename="exucp_effort_regression_plog.png", 
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

svg(paste(args[2],"exucp.svg", sep='\\'))
plot2 = xyplot(Effort ~ EXUCP, EXUCPEffortData,
       grid = TRUE,
#      scales = list(x = list(log = 10, equispaced.log = FALSE)),
      xlab=list(label="EXUCP", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       auto.key = TRUE,
       type = c("p", "r"), lwd = 4)
print(plot2)
print("--------------- EXUCP ~ Effort -------------")
m2.lm = lm(Effort ~ EXUCP, data=EXUCPEffortData)
summary(m2.lm)

# pdf("afpc_effort_regression_plot.pdf")
# png(filename="afpc_effort_regression_plog.png", 
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
svg(paste(args[2],"afpc.svg", sep='\\'))
plot3 = xyplot(Effort ~ AFPC, AFPCEffortData,
       grid = TRUE,
#       scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="AFPC", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       auto.key = TRUE,
       type = c("p", "r"), lwd = 4)
print(plot3)
print("--------------- AFPC ~ Effort -------------")
m3.lm = lm(Effort ~ AFPC, data=AFPCEffortData)
summary(m3.lm)


# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
#par(mfrow=c(2,2))
#print(plot1, position = c(0, 0.5, 0.5, 1), more = TRUE)
#print(plot2, position = c(0.5, 0.5, 1, 1), more = TRUE)
#print(plot3, position = c(0, 0, 0.5, 0.5))

dev.off()

#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)