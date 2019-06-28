#!/usr/bin/env Rscript

#arg1: data url
#arg2: x
#arg3: y1
#arg4: y2
#arg5: summary output path
#arg6: plot output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 4) {
	stop("At least three argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==5) {
	# default output file
	args[5] = ".\\temp\\linear_regression_report.txt"
	args[6] = ".\\temp\\linear-model-plot.svg"
} else if (length(args)==4) {
	# default output file
	args[6] = ".\\temp\\linear-model-plot.svg"
}

dataUrl <- args[1]
xLab <- args[2]
yLab1 <- args[3]
yLab2 <- args[4]
formula1 <- as.formula(paste(yLab1, xLab, sep='~'))
formula2 <- as.formula(paste(yLab2, xLab, sep='~'))
reportPath <- args[5]
svgPath <- args[6]


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

sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)


svg(svgPath)
plot1 = xyplot(formula1, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label=xLab, fontsize=8),
		ylab=list(label=yLab1, fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#print(axis1)
m = lm(formula1, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

plot2 = xyplot(formula2, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label=xLab, fontsize=8),
		#ylab=list(label=yLab2, fontsize=8),
		ylab=list(label='yLab2', fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

print(doubleYScale(plot1, plot2))



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