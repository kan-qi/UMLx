#!/usr/bin/env Rscript

#arg1: data url
#arg2: summary output path
#arg3: plot output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath1 <- paste(outputPath,'nt-linear-regression-report.txt', sep='/')
pngPath1 <- paste(outputPath,'nt-linear-regression-plot.png', sep='/')
reportPath2 <- paste(outputPath,'sloc-linear-regression-report.txt', sep='/')
pngPath2 <- paste(outputPath,'sloc-linear-regression-plot.png', sep='/')




# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries

library(lattice)
library(latticeExtra)
# set the output file

sink(reportPath1)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)


plot1 = xyplot(Effort_Norm~TN, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="TN", fontsize=8),
		ylab=list(label="Effort_Norm", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and TN")
m = lm(Effort_Norm~TN, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

plot2 = xyplot(KSLOC~TN, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="TN", fontsize=8),
		#ylab=list(label=yLab2, fontsize=8),
		ylab=list(label="KSLOC", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#correlation between effort and TN
print("correlation between KSLOC and TN")
m = lm(KSLOC~TN, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

nt_plot1 = doubleYScale(plot1, plot2)

plot3 = xyplot(Effort_Norm~WTN_ALY, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="WTN", fontsize=8),
		ylab=list(label="Effort_Norm", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and WTN")
#print(axis1)
m = lm(Effort_Norm~WTN_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

plot4 = xyplot(KSLOC~WTN_ALY, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="WTN", fontsize=8),
		#ylab=list(label=yLab2, fontsize=8),
		ylab=list(label="KSLOC", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#correlation between effort and TN
print("correlation between KSLOC and WTN")
m = lm(KSLOC~WTN_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

nt_plot2 = doubleYScale(plot3, plot4)

plot5 = xyplot(Effort_Norm~WTNDC_ALY, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="WTNDC", fontsize=8),
		ylab=list(label="Effort_Norm", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and WTNDC")
#print(axis1)
m = lm(Effort_Norm~WTNDC_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

plot6 = xyplot(KSLOC~WTNDC_ALY, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="WTNDC", fontsize=8),
		#ylab=list(label=yLab2, fontsize=8),
		ylab=list(label="KSLOC", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#correlation between effort and WTNDC
print("correlation between KSLOC and WTNDC")
m = lm(KSLOC~WTNDC_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

nt_plot3 = doubleYScale(plot5, plot6)


# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename=pngPath1, 
    type="cairo",
    units="in", 
    width=3*3, 
    height=3*1, 
    pointsize=10, 
    res=96)
par(mfrow=c(3,1))
print(nt_plot1, position = c(0, 0, 0.33, 1), more = TRUE)
print(nt_plot2, position = c(0.34, 0, 0.66, 1), more = TRUE)
print(nt_plot3, position = c(0.67, 0, 0.99, 1))


#also have linear regression on sloc and normalized effort.
sink()
sink(reportPath2)

m = lm(Effort_Norm~KSLOC, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

plot7 = xyplot(Effort_Norm~KSLOC, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="KSLOC", fontsize=8),
		#ylab=list(label=yLab2, fontsize=8),
		ylab=list(label="Effort_Norm", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

png(filename=pngPath2, 
		type="cairo",
		units="in", 
		width=3*1, 
		height=3*1, 
		pointsize=10, 
		res=96)
print(plot7)

#axis2 = axis(4, pretty(range(data[, yLab2])), ylab=list(label=yLab2, fontsize=8))

#axis3 = axis(1, pretty(range(data[, xLab])))

#print(plot2)
#print(axis2)
#print(axis3)

#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)