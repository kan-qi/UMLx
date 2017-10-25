
#sample command line arguments to be sent
#"C:/Program Files/R/R-3.2.2/bin/Rscript" Merged Histograms.R --args  "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e/elementAnalytics.csv" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e/pathAnalytics.csv" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e/expandedPathAnalytics.csv" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e/useCaseAnalytics.csv" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e" 
#Visualize the output in public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e/Merged_Distributions.svg

args = commandArgs(trailingOnly=TRUE)

# arg1: element statistics file path
# arg2: path staitstics file path
# arg3: expanded path statistics file path
# arg4: diagram statistics file path
# arg5: output dir
# arg6: working directory
length(args)
if (length(args) < 4) {
	stop("At least four argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==4) {
	# default output file
	args[5] = "."
	args[6] = '.'
} else if (length(args) == 5){
	args[6] = '.'
}
elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
expandedPathStatisticsPath = args[3]
usecaseStatisticsPath = args[4]
outputDir <- args[5]
workDir <- args[6]

# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset
library(ggplot2)
library(data.table)
elementData <- read.csv(elementStatisticsPath, header=TRUE)
pathData <- read.csv(pathStatisticsPath, header=TRUE)
expandedPathData <- read.csv(expandedPathStatisticsPath, header=TRUE)
usecaseData <- read.csv(usecaseStatisticsPath, header=TRUE)

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
svg(paste(outputDir,"Merged_Distributions.svg",sep="/"))
print(ggplot(DataFrame_Combined, aes(x = intPathData,fill=col)) + geom_density(alpha = 0.5)+xlab("Number of Paths"))
dev.off()
