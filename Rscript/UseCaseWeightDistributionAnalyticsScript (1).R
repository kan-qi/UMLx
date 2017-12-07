#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: use case weight distribution file path
# arg2: transaction distribution for the use cases
# arg3: output dir
# arg4: working directory

if (length(args) < 2) {
	stop("At least 2 arguments must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
	args[4] = '.'
} else if (length(args) == 3){
	args[4] = '.'
}

useCaseWeightInfoPath <- args[1]
transactionInfoPath <- args[2]
outputDir <- args[3]
workDir <- args[4]
reportPath <- paste(outputDir,'use_case_weight_distributions_report.txt', sep='/')
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
library(ggplot2)
library(data.table)
#library(ggfortify)

sink(reportPath)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset
useCaseWeightInfo=read.csv(useCaseWeightInfoPath,header=TRUE)
transactionInfo=read.csv(transactionInfoPath,header=TRUE)
# cat(slocEffortData[0])
# result <- str(slocEffortData)
# cat(result)
# head(umlData[, 4])

#draw trending line based on version info
svg(paste(outputDir,"use_case_weight_distributions.svg",sep="/"), width=8, height=4)
print("use case weight info")
print(useCaseWeightInfo)

meltUseCaseWeightInfo = melt(useCaseWeightInfo, id.vars="Tran_Num", value.name="Value", variable.name="Weight")
print("melt use case weight info")
print(meltUseCaseWeightInfo)

maxWeight <- max(meltUseCaseWeightInfo$Value)
meltUseCaseWeightInfo$Value <- meltUseCaseWeightInfo$Value/maxWeight*0.2

print(ggplot() + 
	geom_density(data=transactionInfo, aes(x=NT), colour="black")+
	geom_line(data=meltUseCaseWeightInfo, aes(x=Tran_Num, y=Value, group=Weight, color=Weight),)+
	geom_point(size=2, shape=21, fill="white")+
	ggtitle("Use Case Weights")+
	scale_y_continuous(sec.axis = sec_axis(~.*maxWeight/0.2, name="Weight"))+
	labs(y = "Percentage", x = "Number of Transaction")+
	geom_vline(xintercept=c(3,7),linetype="dashed", size=1)
)

svg(paste(outputDir,"transaction_distribution.svg",sep="/"), width=8, height=4)
print(ggplot(transactionInfo, aes(x=NT, fill=cond))+ geom_histogram(binwidth=.5, colour="black", fill="white"))

#populateFreq <- function(row){
#	row$Freq=1
	
#	print(as.numeric(tranDistTable[row$NT]))
	
#	tranDist[which(tranDist$NT==row$NT),]$Freq <- as.numeric(tranDistTable[row$NT])
#}

# Here starts the procedure of calculating the apriori means.
#step1. Convert to frequency for the number of transactions.
tranDistTable <- table(transactionInfo$NT)
#tranDist$NT <- as.numeric(tranDist$NT)
#tranDist$Freq <- as.numeric(tranDist$Freq)
NT <- c(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30)
Freq <- c(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)
tranDist = data.frame ("NT" = NT, "Freq"=Freq)
#by(tranDist, 1:nrow(tranDist), function(row) populateFreq(row))
#apply(tranDist, 1, populateFreq)

for(i in 1:nrow(tranDist)) {
	row <- tranDist[i,]
	# do stuff with row
	row$Freq=1
	
	#print(as.numeric(tranDistTable[row$NT]))
	
	tranDist[which(tranDist$NT==row$NT),]$Freq <- as.numeric(tranDistTable[row$NT])
	
	tranDist[is.na(tranDist)] <- 0
}

print(tranDist)

#simpleTranDist <- tranDist[which(tranDist$NT>0 & tranDist$NT < 5),]
simpleTranDist <- subset(tranDist, NT>0 & NT < 4)
simpleTranDist$Freq <- simpleTranDist$Freq/sum(simpleTranDist$Freq)
print(simpleTranDist)
averageTranDist <- subset(tranDist, NT>3 & NT < 8)
averageTranDist$Freq <- averageTranDist$Freq/sum(averageTranDist$Freq)
print(averageTranDist)
complexTranDist <- subset(tranDist, NT>7)
complexTranDist$Freq <- complexTranDist$Freq/sum(complexTranDist$Freq)
print(complexTranDist)


#step 2. For each each weight schema, calculate the mean and variance.
simpleWeight = useCaseWeightInfo[which(useCaseWeightInfo$Tran_Num > 0 & useCaseWeightInfo$Tran_Num < 4),]
print(simpleWeight)
simpleMeans = unlist(list(t(simpleWeight$Weight1) %*% simpleTranDist$Freq,
		t(simpleWeight$Weight2) %*% simpleTranDist$Freq,
		t(simpleWeight$Weight3) %*% simpleTranDist$Freq,
		t(simpleWeight$Weight4) %*% simpleTranDist$Freq,
		t(simpleWeight$Weight5) %*% simpleTranDist$Freq
		))
print("calculated means:")
print(simpleMeans)
print("apriori estimated mean")
print(mean(simpleMeans))
print("apriori estimated variance")
print(var(simpleMeans))

averageWeight = useCaseWeightInfo[which(useCaseWeightInfo$Tran_Num > 3 & useCaseWeightInfo$Tran_Num < 8),]
print(averageWeight)
averageMeans = unlist(list(t(averageWeight$Weight1) %*% averageTranDist$Freq,
				t(averageWeight$Weight2) %*% averageTranDist$Freq,
				t(averageWeight$Weight3) %*% averageTranDist$Freq,
				t(averageWeight$Weight4) %*% averageTranDist$Freq,
				t(averageWeight$Weight5) %*% averageTranDist$Freq
		))
print(averageMeans)
print("apriori estimated mean")
print(mean(averageMeans))
print("apriori estimated variance")
print(var(averageMeans))

complexWeight = useCaseWeightInfo[which(useCaseWeightInfo$Tran_Num > 7),]
print(complexWeight)
complexMeans = unlist(list(t(complexWeight$Weight1) %*% complexTranDist$Freq,
				t(complexWeight$Weight2) %*% complexTranDist$Freq,
				t(complexWeight$Weight3) %*% complexTranDist$Freq,
				t(complexWeight$Weight4) %*% complexTranDist$Freq,
				t(complexWeight$Weight5) %*% complexTranDist$Freq
		))
print(complexMeans)
print("apriori estimated mean")
print(mean(complexMeans))
print("apriori estimated variance")
print(var(complexMeans))

#print(complexTranDist$Freq)
#print(complexWeight$Weight5)
#print(t(complexWeight$Weight5) %*% complexTranDist$Freq)
#print(t(complexTranDist$Freq) %*% complexWeight$Weight5)

#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
