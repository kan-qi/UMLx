#!/usr/bin/env Rscript

#arg1: data url
#arg2: summary output path
#arg3: plot output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least one argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp"
} 

dataUrl <- args[1]
outputDir <- args[2]
reportPath <- paste(outputDir, "transaction_type_percentage_report.txt", sep="/")
svgPath <- paste(outputDir, "transaction_type_percentage_plot.svg", sep="/")


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
transactionalData <- factor(data[data$transactional != 'TRAN_NA' & data$transactional != 'EQ' & data$transactional != 'EI', 'transactional'])
#transactionalData <- data[, 'transactional']
svg(svgPath)
# Pie Chart from data frame with Appended Sample Sizes
#percentlabels<- round(100*transactionalData/sum(transactionalData), 1)
mytable <- table(transactionalData)
print(mytable)
#mytable$TRAN_NA= NULL
#colors = c("red", "yellow", "green", "violet", "orange", "blue", "pink", "cyan") 
#colors = c("cyan", "white", "cornsilk", "purple", "violetred1", "green3")
colors=c("#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677","#AA4499")
percentageLbls = paste(round(100*mytable/sum(mytable), 1),"%", sep="")
lbls <- names(mytable) 
pieChart <- pie(mytable, labels = percentageLbls, main="Distribution of Types of Operations", col=colors)
print(pieChart)
legend("topright", lbls, cex=0.8, fill=colors)
#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)