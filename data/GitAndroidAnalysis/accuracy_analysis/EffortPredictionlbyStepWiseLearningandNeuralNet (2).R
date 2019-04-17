#!/usr/bin/env Rscript

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./Temp"
}

dataUrl <- args[1]
outputPath <- args[2]
reportPath <- paste(outputPath,'risk-predication-model-training-report.txt', sep='/')

# dataUrl <- "./Data/Input_Data_Example.csv"
# outputPath <- "./Temp"
# reportPath <- paste(outputPath,'risk-predication-model-training-report.txt', sep='/')

library(lattice)
library(ggplot2)
library(neuralnet)

# setwd("E:/WorkSpace/Huawei/R/Risk_Prediction_Model_Calibration")
#sink(reportPath, append=TRUE, split=TRUE)
sink(reportPath)

df <- read.csv(dataUrl, header=TRUE, sep=",")
names <- colnames(df)
print('names')
riskLabels <- names[grepl("RISK*", names)];

#total row in excel file
total_rows= nrow(df)
#In each set how many test data rows(Always less than nfold)
num_of_test_rows=50
#stepwise learning to decide the input factors
colnames <- c("RELY","DATA","CPLX","RUSE","DOCU","TIME","STOR","PVOL","ACAP","PCAP","PCON","APEX","PLEX","LTEX","TOOL","SITE","SCED","CSmell","SVul","AA","PR","ETT","FCR","CD","ISS", "ISRR","DRR")
#print(c(colnames, riskLabels))
t <- df[1:total_rows,c(colnames, riskLabels)]
print("x")
print(t)
num_columns <- length(colnames)
#num_columns <- num_columns-1
clssRate = data.frame(colname=as.character(),rate=numeric(0))
print(clssRate)
colnames(clssRate) <- c("colname","rate")
print(num_columns)
#eliminating one column at a time at determing ranking
for (i in 1: (num_columns-5)){
		sum=0.0
		#t[c(colnames[i])] <- NULL
		foldData = t[,c(colnames[!colnames %in% colnames[i]],riskLabels)]
		#print(temp_train)
		#print(temp_train)
		names <- names(foldData)
		print(names)
		temp_train <- foldData[1:(total_rows - num_of_test_rows),]
		f <- as.formula(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~")) 
		#f <- as.formula(paste("Effort ~ ", paste(n[!n %in% "Effort"], collapse= "+"))) #making a formula to fit to neural net
		#weights <- c(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
		#		1,0,0,0,0,0) 
		#nn <- neuralnet(f,data=temp_train[1:nrow(temp_train),],hidden=c(5),linear.output=T,startweights = weights) #model with one hidden layer and one neuron
		nn <- neuralnet(f, data=temp_train, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron
		
		#plot(nn)
		
	#print((total_rows - num_of_test_rows)+1)
	temp_test <- foldData[c((total_rows - num_of_test_rows+1):total_rows),]
	print(temp_test)
	
	#fnn <- neuralnet(f, data=trainData, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron
	pr.nn <- compute(nn,temp_test[c(names[!names %in% riskLabels])])
	
	#print('the predictions results for testing data set')
	#print(pr.nn$net.result)
	iterationPredictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))
	#print('the predicted level of risk for testing data set')
	#print(iterationPredictions)
	print("testing data set actual risk")
	runActualCls = as.matrix(apply(temp_test[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	runPredictionResult = apply(cbind(iterationPredictions, runActualCls), 1, function(x){x[1] == x[2]});
	#print(runPredictionResult)
	#print(length(runPredictionResult[runPredictionResult == TRUE]))
	runClsRate = length(runPredictionResult[runPredictionResult == TRUE])/length(runPredictionResult)
	print("run classification error")
	print(colnames[i])
	print(runClsRate)
	clssRate = rbind(clssRate, data.frame(colname=colnames[i], rate=runClsRate))
}

print("cls rate")
print(clssRate[order(clssRate$rate),c(1,2)]);


#iteratively remove the factors
for (i in 1: nrow(clssRate)){
	sum=0.0
	print("iterating...")
	print(as.character(clssRate[i, "colname"]))
	t[c(as.character(clssRate[i, "colname"]))] <- NULL
	#foldData = t[,c(colnames[!colnames %in% colnames[i]],riskLabels)]
	#print(temp_train)
	#print(temp_train)
	names <- names(t)
	print(names)
	#temp_train <- t[1:(total_rows - num_of_test_rows),]
	#temp_train <- t
	f <- as.formula(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~"))
	print(f)
	#f <- as.formula(paste("Effort ~ ", paste(n[!n %in% "Effort"], collapse= "+"))) #making a formula to fit to neural net
	#weights <- c(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	#		1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	#		1,0,0,0,0,0) 
	#nn <- neuralnet(f,data=temp_train[1:nrow(temp_train),],hidden=c(5),linear.output=T,startweights = weights) #model with one hidden layer and one neuron
	nn <- neuralnet(f, data=t, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron
	
	#plot(nn)
	
	#print((total_rows - num_of_test_rows)+1)
	#temp_test <- t[c((total_rows - num_of_test_rows+1):total_rows),]
	#print(temp_test)
	
	#fnn <- neuralnet(f, data=trainData, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron
	pr.nn <- compute(nn,t[c(names[!names %in% riskLabels])])
	
	#print('the predictions results for testing data set')
	#print(pr.nn$net.result)
	iterationPredictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))
	#print('the predicted level of risk for testing data set')
	#print(iterationPredictions)
	print("testing data set actual risk")
	runActualCls = as.matrix(apply(t[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	runPredictionResult = apply(cbind(iterationPredictions, runActualCls), 1, function(x){x[1] == x[2]});
	#print(runPredictionResult)
	#print(length(runPredictionResult[runPredictionResult == TRUE]))
	runClsRate = length(runPredictionResult[runPredictionResult == TRUE])/length(runPredictionResult)
	print("feature selection run")
	#print(colnames[i])
	print(runClsRate)
	#clssRate = rbind(clssRate, data.frame(colname=colnames[i], rate=runClsRate))
}

names <- colnames(df)
#print(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~"))
#f <- as.formula(paste("RISK1+RISK2+RISK3+RISK4+RISK5~", paste(names[!names %in% "RISK*"], collapse= "+"))) #making a formula to fit to neural net
f <- as.formula(paste(paste(riskLabels, collapse= "+"), paste(names[!names %in% riskLabels], collapse= "+"), sep="~")) #making a formula to fit to neural net
print(f)

nn <- neuralnet(f, data=df, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron

# The information that is printed will be output into risk-predication-model-training-report.txt
print(nn)

# The following part implement the logic for 5-fold cross validation to estimate the predication accuracy. For cross validation, it is testing out-of-sample predication accuracy, which have better predication on predication accuracy on un-seen data points.
nfold = 10
print("sequence")
print(seq(1,nrow(df)))
folds <- cut(seq(1,nrow(df)),breaks=nfold,labels=FALSE)
#print("folds")
#print(folds)
clsRate <- c()

for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	print("test indexes")
	print(testIndexes)
	trainData <- df[-testIndexes, ]
	testData <- df[testIndexes, ]
	
	fnn <- neuralnet(f, data=trainData, hidden=3, act.fct = "logistic", linear.output = FALSE) #model with one hidden layer and one neuron
	pr.nn <- compute(nn,testData[c(names[!names %in% riskLabels])])
	
	print('the predictions results for testing data set')
	print(pr.nn$net.result)
	foldPredictions = as.matrix(apply(pr.nn$net.result, 1, FUN=which.max))
	print(foldPredictions)
	print("testing data set actual risk")
	foldActualCls = as.matrix(apply(testData[c(names[names %in% riskLabels])], 1, function(x)which(x==1)))
	foldPredictionResult = apply(cbind(foldPredictions, foldActualCls), 1, function(x){x[1] == x[2]});
	print(foldPredictionResult)
	#print(length(foldPredictionResult[foldPredictionResult == TRUE]))
	foldClsRate = length(foldPredictionResult[foldPredictionResult == TRUE])/length(foldPredictionResult)
	print(foldClsRate)
	clsRate = append(clsRate, foldClsRate)
}

print("testing results")
print(clsRate)
print(mean(clsRate))


plot(nn)

sink()