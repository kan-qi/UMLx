#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: transaction analytics file path
# arg2: output dir
# arg3: working directory

if (length(args) < 1) {
	stop("At least one argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "."
	args[3] = "."
} else if(length(args) == 2){
	args[3] = "."
}

transactionAnalyticsPath = args[1]
outputDir <- args[2]
workDir <- args[3]
reportPath <- paste(outputDir, 'report.txt', sep='/')
# store the current directory
initial.dir<-getwd()
setwd(workDir)

sink(reportPath)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset

transactionData <- read.csv(transactionAnalyticsPath, header=TRUE)
#transactionData <- read.csv(expandedPathStatisticsPath, header=TRUE)
# cat(slocEffortData[0])
# result <- str(slocEffortData)
# cat(result)
# head(umlData[, 4])

# main="Histogram for Air Passengers",
#      xlab="Passengers",
#      border="blue",
#      col="green",
#      xlim=c(100,700),
#      las=1,
#      breaks=5

#setwd("")
intPathData = transactionData[transactionData$transactional == "INT", ]$tran_length
if(length(intPathData) == 0 || is.na(intPathData)){
	intPathData = c(0);
}
intPathData = as.numeric(intPathData)

ctrlPathData = transactionData[transactionData$transactional == "CTRL",]$tran_length
if(length(ctrlPathData) == 0 || is.na(ctrlPathData)){
	ctrlPathData = c(0);
}
ctrlPathData = as.numeric(ctrlPathData)

eiPathData = transactionData[transactionData$transactional == "EI",]$tran_length
if(length(eiPathData) == 0 || is.na(eiPathData)){
	eiPathData = c(0);
}
eiPathData = as.numeric(eiPathData)

eqPathData = transactionData[transactionData$transactional == "EQ",]$tran_length
if(length(eqPathData) == 0 || is.na(eqPathData)){
	eqPathData = c(0);
}
eqPathData = as.numeric(eqPathData)

extivkPathData = transactionData[transactionData$transactional == "EXTIVK",]$tran_length
if(length(extivkPathData) == 0 || is.na(extivkPathData)){
	extivkPathData = c(0);
}
extivkPathData = as.numeric(extivkPathData)

extcllPathData = transactionData[transactionData$transactional == "EXTCLL",]$tran_length
if(length(extcllPathData) == 0 || is.na(extcllPathData)){
	extcllPathData = c(0);
}
extcllPathData = as.numeric(extcllPathData)

naPathData = transactionData[transactionData$transactional == "TRAN_NA",]$tran_length
if(length(naPathData) == 0 || is.na(naPathData)){
	naPathData = c(0);
}
naPathData = as.numeric(naPathData)

svg(paste(outputDir,"interface_operation_analysis_result.svg", sep="/"))
print(hist(intPathData, main="Inteface Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"control_operation_analysis_result.svg", sep="/"))
print(hist(ctrlPathData, main="Control Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_input_operation_analysis_result.svg", sep="/"))
print(hist(eiPathData, main="External Input Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_query_operation_analysis_result.svg", sep="/"))
print(hist(eqPathData, main="External Query Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_invocation_operation_analysis_result.svg", sep="/"))
print(hist(extivkPathData, main="External Invocation Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"external_call_operation_analysis_result.svg", sep="/"))
print(hist(extcllPathData, main="External Call Operation Num", xlab="Path Length", breaks=15))
svg(paste(outputDir,"not_matched_analysis_result.svg", sep="/"))
print(hist(naPathData, main="Not Matched Operation Num", xlab="Path Length", breaks=15))


transactionalPatternCounts <- table(transactionData$transactional)
if(length(transactionalPatternCounts) == 0){
	transactionalPatternCounts <- matrix(c(0,0),
			nrow=1, 
			ncol=1)
}
#functionalPatternCounts <- table(transactionData$functional)
#if(length(functionalPatternCounts) == 0){
#	functionalPatternCounts <- matrix(c(0,0),
#			nrow=1, 
#			ncol=1)
#	
#}

svg(paste(outputDir,"trasactional_pattern_counts.svg", sep="/"))
print(barplot(transactionalPatternCounts, main="Transactional Pattern Counts", xlab="Transactional Patterns"))
#svg(paste(outputDir,"functional_pattern_counts.svg", sep="/"))
#print(barplot(functionalPatternCounts, main="Functional Pattern Counts", xlab="Functional Patterns"))


#draw the piechart for the types of operations
transactionDistData <- factor(transactionData[transactionData$transactional != 'TRAN_NA' & transactionData$transactional != 'EQ' & transactionData$transactional != 'EI', 'transactional'])
#transactionData <- data[, 'transactional']
svg(paste(outputDir, "transaction_type_percentage_plot.svg", sep="/"), width=5, height=5)
# Pie Chart from data frame with Appended Sample Sizes
#percentlabels<- round(100*transactionData/sum(transactionData), 1)
mytable <- table(transactionDistData)
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


transactionArchDiffData = transactionData$arch_diff
print("hello")
print(transactionArchDiffData)
if(length(transactionArchDiffData) == 0){
	transactionArchDiffData = c(0);
}
transactionArchDiffData = as.numeric(transactionArchDiffData)

transactionLengthData = transactionData$tran_length
if(length(transactionLengthData) == 0){
	transactionLengthData = c(0);
}

svg(paste(outputDir,"transaction_arch_diff_analysis_result.svg", sep="/"))
print(hist(transactionArchDiffData, main="Transaction Architecture Difficulty", xlab="Transaction Arch Diff", breaks=15))

svg(paste(outputDir,"transaction_length_analysis_result.svg", sep="/"))
print(hist(transactionLengthData, main="Transaction Length", xlab="Transaction Length", breaks=15))



sink()

#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
