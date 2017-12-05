#!/usr/bin/env Rscript

#arg1: data url
#arg2: x
#arg3: y
#arg4: summary output path
#arg5: plot output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 3) {
	stop("At least three argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==3) {
	# default output file
	args[4] = ".\\temp\\linear_regression_report.txt"
	args[5] = ".\\temp\\linear-model-plot.svg"
} else if (length(args)==4) {
	# default output file
	args[5] = ".\\temp\\linear-model-plot.svg"
}

dataUrl <- args[1]
xLab <- args[2]
yLab <- args[3]
formula <- as.formula(paste(yLab, xLab, sep='~'))
reportPath <- args[4]
svgPath <- args[5]


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


data <- read.csv(dataUrl, header=TRUE)


svg(svgPath)
plot = xyplot(formula, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label=xLab, fontsize=8),
		ylab=list(label=yLab, fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)
print(plot)
m = lm(formula, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)