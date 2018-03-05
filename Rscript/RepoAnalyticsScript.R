#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: path staitstics file path
# arg3: expanded path statistics file path
# arg4: use case statistics file path
# arg5: model version info file path
# arg6: output dir
# arg7: working directory

if (length(args) < 5) {
	stop("At least five arguments must be supplied (input file).", call.=FALSE)
} else if (length(args)==5) {
	# default output file
	args[6] = "."
	args[7] = '.'
} else if (length(args) == 6){
	args[7] = '.'
}

elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
expandedPathStatisticsPath = args[3]
usecaseStatisticsPath = args[4]
modelVersionInfoPath = args[5]
outputDir <- args[6]
workDir <- args[7]
reportPath <- paste(outputDir,'repo_analysis_report.txt', sep='/')
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
sink(reportPath)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset
library(ggplot2)
library(data.table)
elementData <- read.csv(elementStatisticsPath, header=TRUE)
pathData <- read.csv(pathStatisticsPath, header=TRUE)
expandedPathData <- read.csv(expandedPathStatisticsPath, header=TRUE)
usecaseData <- read.csv(usecaseStatisticsPath, header=TRUE)
modelVersionInfo=read.csv(modelVersionInfoPath,header=TRUE)
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
intPathData = expandedPathData[expandedPathData$transactional == "INT", ]$path_length
if(length(intPathData) == 0 || is.na(intPathData)){
	intPathData = c(0);
}
intPathData = as.numeric(intPathData)

ctrlPathData = expandedPathData[expandedPathData$transactional == "CTRL",]$path_length
if(length(ctrlPathData) == 0 || is.na(ctrlPathData)){
	ctrlPathData = c(0);
}
ctrlPathData = as.numeric(ctrlPathData)

eiPathData = expandedPathData[expandedPathData$transactional == "EI",]$path_length
if(length(eiPathData) == 0 || is.na(eiPathData)){
	eiPathData = c(0);
}
eiPathData = as.numeric(eiPathData)

eqPathData = expandedPathData[expandedPathData$transactional == "EQ",]$path_length
if(length(eqPathData) == 0 || is.na(eqPathData)){
	eqPathData = c(0);
}
eqPathData = as.numeric(eqPathData)

extivkPathData = expandedPathData[expandedPathData$transactional == "EXTIVK",]$path_length
if(length(extivkPathData) == 0 || is.na(extivkPathData)){
	extivkPathData = c(0);
}
extivkPathData = as.numeric(extivkPathData)

extcllPathData = expandedPathData[expandedPathData$transactional == "EXTCLL",]$path_length
if(length(extcllPathData) == 0 || is.na(extcllPathData)){
	extcllPathData = c(0);
}
extcllPathData = as.numeric(extcllPathData)

naPathData = expandedPathData[expandedPathData$transactional == "TRAN_NA",]$path_length
if(length(naPathData) == 0 || is.na(naPathData)){
	naPathData = c(0);
}
naPathData = as.numeric(naPathData)


#Added the smoothing distributions for the number of transactions for different types.
#converting the numeric vectors into data frames
DataFrame_Interface_Operation=as.data.frame(intPathData)
DataFrame_Control_Operation=as.data.frame(ctrlPathData)
DataFrame_External_Input_Operation=as.data.frame(eiPathData)
DataFrame_External_Query_Operation=as.data.frame(eqPathData)
DataFrame_External_Invocation_Operation=as.data.frame(extivkPathData)
DataFrame_Not_Matched_Operation=as.data.frame(naPathData)
# adding a column called col for each document for visualizing each dataframe through a color
DataFrame_Interface_Operation$col="Interface_Operation"
DataFrame_Control_Operation$col="Control_Operation"
DataFrame_External_Input_Operation$col="External_Input_Operation"
DataFrame_External_Query_Operation$col="External_Query_Operation"
DataFrame_External_Invocation_Operation$col="External_Invocation_Operation"
DataFrame_Not_Matched_Operation$col="Not_Matched_Operation"


#combine all the 6 data frames
DataFrame_Combined=data.frame(mapply(c,DataFrame_Interface_Operation,DataFrame_Control_Operation,
				DataFrame_External_Input_Operation,DataFrame_External_Query_Operation,DataFrame_External_Invocation_Operation,
				DataFrame_Not_Matched_Operation,SIMPLIFY=FALSE))
print(DataFrame_Combined)
svg(paste(outputDir,"merged_distributions_for_transactions.svg",sep="/"))
print(ggplot(DataFrame_Combined, aes(x = intPathData,fill=col)) + geom_density(alpha = 0.5)+xlab("Number of Paths"))
## end of the smoothing distributions.

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


#draw trending line based on version info
svg(paste(outputDir,"trending_lines.svg",sep="/"), width=12, height=3)
print("model version info")
print(modelVersionInfo)
print(ggplot(modelVersionInfo,aes(x=update_time,group=1))+geom_line(aes(y=number_of_paths))+ggtitle("Number of Transactions"))


#draw the piechart for the types of operations
transactionalData <- factor(expandedPathData[expandedPathData$transactional != 'TRAN_NA' & expandedPathData$transactional != 'EQ' & expandedPathData$transactional != 'EI', 'transactional'])
#transactionalData <- data[, 'transactional']
svg(paste(outputDir, "transaction_type_percentage_plot.svg", sep="/"), width=5, height=5)
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


transactionArchDiffData = pathData[c('arch_diff')]
if(length(transactionArchDiffData) == 0){
	transactionArchDiffData = c(0);
}
transactionArchDiffData = as.numeric(transactionArchDiffData)

transactionLengthData = pathData[c('path_length')]
if(length(transactionLengthData) == 0){
	transactionLengthData = c(0);
}

svg(paste(outputDir,"transaction_arch_diff_analysis_result.svg", sep="/"))
print(hist(transactionArchDiffData, main="Transaction Architecture Difficulty", xlab="Transaction Arch Diff", breaks=15))

svg(paste(outputDir,"transaction_length_analysis_result.svg", sep="/"))
print(hist(transactionLengthData, main="Transaction Length", xlab="Transaction Length", breaks=15))


#diagram statistics

usecaseDataCol3 = pathData[,3]
if(length(usecaseDataCol3) == 0){
	usecaseDataCol3 = c(0);
}
usecaseDataCol3 = as.numeric(usecaseDataCol3)

usecaseDataCol4 = pathData[,4]
if(length(usecaseDataCol4) == 0){
	usecaseDataCol4 = c(0);
}
usecaseDataCol4 = as.numeric(usecaseDataCol4)

usecaseDataCol5 = pathData[,5]
if(length(usecaseDataCol5) == 0){
	usecaseDataCol5 = c(0);
}
usecaseDataCol5 = as.numeric(usecaseDataCol5)

usecaseDataCol6 = usecaseData[,6]
if(length(usecaseDataCol6) == 0){
	usecaseDataCol6 = c(0);
}
usecaseDataCol6 = as.numeric(usecaseDataCol6)

svg(paste(outputDir,"average_degree_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol3, main="Average Degree", xlab="Average Degree", breaks=15))
svg(paste(outputDir,"average_path_length_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol4, main="Average Path Length", xlab="Average Path Length", breaks=15))
svg(paste(outputDir,"architecture_difficulty_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol5, main="Architecture Difficulty", xlab="Architecture Difficulty", breaks=15))
svg(paste(outputDir,"path_number_analysis_result.svg", sep="/"))
print(hist(usecaseDataCol6, main="Path Number", xlab="Path Number", breaks=15))


#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
