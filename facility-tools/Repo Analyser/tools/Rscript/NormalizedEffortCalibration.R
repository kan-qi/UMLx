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
# pdf("normalized_regression_plot.pdf") 
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
# png(filename="eucp_normalized_effort_regression_plog.png", 
#     type="cairo",
#     units="in", 
#     width=3, 
#     height=3, 
#     pointsize=12, 
#     res=96)
# print(xyplot(Effort ~ EUCPW, EUCPEffortData,
#        grid = TRUE,
#       # scales = list(x = list(log = 10, equispaced.log = FALSE)),
#        xlab=list(label="EUCP", fontsize=8),
#        ylab=list(label="Effort (man-hours)", fontsize=8),
#        group = Type, auto.key = TRUE,
#        type = c("p", "r"), lwd = 4))

plot1 = xyplot(Effort ~ EUCPW, EUCPEffortData,
       grid = TRUE,
      # scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="EUCP", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       group = Type,
       auto.key=list(x=0,y=0,text=c("",""),points=FALSE, lines=FALSE,col=c(1,2)),
       type = c("p", "r"), lwd = 4)


# png(filename="exucp_normalized_effort_regression_plog.png", 
#     type="cairo",
#     units="in", 
#     width=3, 
#     height=3, 
#     pointsize=12, 
#     res=96)
# print(xyplot(Effort ~ EXUCPW, EXUCPEffortData,
#        grid = TRUE,
# #      scales = list(x = list(log = 10, equispaced.log = FALSE)),
#        xlab=list(label="EXUCP", fontsize=8),
#        ylab=list(label="Effort (man-hours)", fontsize=8),
#        group = Type, auto.key = TRUE,
#        type = c("p", "r"), lwd = 4))
plot2 = xyplot(Effort ~ EXUCPW, EXUCPEffortData,
       grid = TRUE,
#      scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="EXUCP", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       group = Type,
       auto.key=list(x=0,y=0,text=c("",""),points=FALSE, lines=FALSE,col=c(1,2)),
       type = c("p", "r"), lwd = 4)

# png(filename="afpc_normalized_effort_regression_plog.png", 
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
#        group = Type, auto.key = TRUE,
#        type = c("p", "r"), lwd = 4))
plot3 = xyplot(Effort ~ AFPC, AFPCEffortData,
       grid = TRUE,
#       scales = list(x = list(log = 10, equispaced.log = FALSE)),
       xlab=list(label="AFPC", fontsize=8),
       ylab=list(label="Effort (man-hours)", fontsize=8),
       group = Type, 
       auto.key=list(x=1.2,y=0.6,text=c("PH",expression("PH"["norm"])),points=TRUE, lines=FALSE,col=c(1,2)),
       type = c("p", "r"), lwd = 4)
# legend("topleft", c("mean", "5th and 95th percentiles"), lty = c(1, 3), col = c(1, 
#     2), lwd = 3)

png(filename="normalized_regression_plot.png", 
    type="cairo",
    units="in", 
    width=3*3+1, 
    height=3*1, 
    pointsize=10, 
    res=96)
par(mfrow=c(1,3))
print(plot1, position = c(0, 0, 0.3, 1), more = TRUE)
print(plot2, position = c(0.31, 0, 0.6, 1), more = TRUE)
print(plot3, position = c(0.61, 0, 0.9, 1))

dev.off()
#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)