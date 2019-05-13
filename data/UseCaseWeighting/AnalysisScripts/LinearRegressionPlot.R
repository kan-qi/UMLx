#!/usr/bin/env Rscript

#arg1: data url
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 2 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath <- paste(outputPath,'use-case-point-weight-regression-report.txt', sep='/')

library(lattice)
library(ggplot2)
sink(reportPath)

useCaseData <- read.csv(dataUrl, header=TRUE)

ucpFit <- lm(Real_Effort_Person_Hours ~ UCP - 1, data = useCaseData)
normFactor <- coef(ucpFit)[c('UCP')]
print("norm factor")
#normFactor <- 12
print(normFactor)

print("normalized UUCW")
normUUCW <- useCaseData[,'Real_Effort_Person_Hours']/(useCaseData[,'TCF']*useCaseData[,'EF']*normFactor) - useCaseData[, 'UAW']
print(normUUCW)
useCaseData$norm_UUCW = normUUCW

fit <- lm(norm_UUCW ~ Simple_UC + Average_UC + Complex_UC-1, data=useCaseData)

#print out predicted values
predictedValues <- data.frame(predict(fit), useCaseData[, "norm_UUCW"])
colnames(predictedValues) <- c("Predicted_UUCW", "Actual_UUCW")

print(predictedValues);

r2Vals <- summary(fit)$r.squared
r2Vals <- round(r2Vals, digits = 5)
r2data_txt <- paste("r2:", r2Vals, sep = "")

plot <- ggplot(predictedValues, aes(x = Predicted_UUCW, y = Actual_UUCW)) +
		geom_point(shape = 1) + stat_smooth(method = "lm",  se = FALSE, fullrange = TRUE) +
		xlab("Predicted UUCW") +
		ylab("Actual UUCW") + ggtitle("MLR for Weight Calibration") +
		theme(panel.spacing = unit(1, "lines"))


svg(paste(outputPath,"regression_plot.svg", sep="/"), width=5, height=3)

print(plot)

#also have linear regression on sloc and normalized effort.
sink()

