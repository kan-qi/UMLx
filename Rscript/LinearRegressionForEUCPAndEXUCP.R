#!/usr/bin/env Rscript

#arg1: data url
#arg2: summary output path
#arg3: plot output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath <- paste(outputPath,'eucp-exucp-linear-regression-report.txt', sep='/')
pngPath <- paste(outputPath,'eucp-exucp-linear-regression-plot.png', sep='/')




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
library(reshape)
#library(dplyr)

sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)
tranData <- data[c("Effort_Norm", "EUCP", "EXUCP")]
#tranDataMelt <- gather(tranData, key=variable, value=value, EUCP, EXUCP, WTNDC_ALY)
tranDataMelt <- melt(tranData, id=c("Effort_Norm"))

print(tranDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and EUCP")
#cor1 = cor(data$Effort_Norm, data$EUCP)
print("linear regression of effort on EUCP")
m1 = lm(Effort_Norm~EUCP, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
summary(m1)$r.squared
newx1 <- seq(-100, max(data$EUCP)+100, length.out=100)
pred1 = predict(m1,data.frame(EUCP=newx1), interval='confidence')
print(coeff1)

#correlation between effort and TN
print("correlation between effort and EXUCP")
#cor2 = cor(data$Effort_Norm, data$EXUCP)
print("linear regression of effort on EXUCP")
#print(axis1)
m2 = lm(Effort_Norm~EXUCP, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff2 = summary(m2)$coefficients
summary(m2)$r.squared
newx2 <- seq(-100, max(data$EXUCP)+100, length.out=100)
pred2 = predict(m2,data.frame(EXUCP=newx2), interval='confidence')
print(coeff2)

plot = xyplot(Effort_Norm~ value | variable, data=tranDataMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Software Sizes", fontsize=10),
		ylab=list(label="Effort (man-hours)", fontsize=10),
		strip =strip.custom(factor.levels = c("EUCP","EXUCP")),
		scales=list(x=list(relation="free")),
		auto.key = TRUE,
		type = c("p", "r"))

# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename=pngPath,
		type="cairo",
		units="in", 
		width=3*2, 
		height=3*1,
		res=96)
print(plot)


#also have linear regression on sloc and normalized effort.
sink()

# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)