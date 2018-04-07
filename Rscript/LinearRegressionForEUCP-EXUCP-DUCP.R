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
useCaseData <- data[c("Effort_Real", "EUCP", "EXUCP", "DUCP")]
#useCaseDataMelt <- gather(useCaseData, key=variable, value=value, EUCP, EXUCP, WTNDC_ALY)
useCaseDataMelt <- melt(useCaseData, id=c("Effort_Real"))

print(useCaseDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and EUCP")
cor1 = cor(data$Effort_Real, data$EUCP)
print("linear regression of effort on EUCP")
m1 = lm(Effort_Real~EUCP, data=data)


#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
summary(m1)$r.squared
newx1 <- seq(-100, max(data$EUCP)+100, length.out=100)
pred1 = predict(m1,data.frame(EUCP=newx1), interval='confidence')
print(coeff1)
eucp.predict = cbind(predicted=predict(m1, data), actual=data$Effort_Real)
print("predicted values")
print(eucp.predict)

#generate description file.
saveRDS(cor1, "./statistical_models/eucp_linear_model_cor.rds")
saveRDS(m1, "./statistical_models/eucp_linear_model.rds")

#correlation between effort and TN
print("correlation between effort and EXUCP")
cor2 = cor(data$Effort_Real, data$EXUCP)
print("linear regression of effort on EXUCP")
#print(axis1)
m2 = lm(Effort_Real~EXUCP, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]


#NUMBER of training data
number_train <- dim(Effort_Real)[1]
saveRDS(number_train, "./statistical_models/exucp_linear_model_train.rds")

#NUMBER of testing data
number_test <- dim(m1)[1]
saveRDS(number_test, "./statistical_models/exucp_linear_model_test.rds")

coeff2 = summary(m2)$coefficients
summary(m2)$r.squared
newx2 <- seq(-100, max(data$EXUCP)+100, length.out=100)
pred2 = predict(m2,data.frame(EXUCP=newx2), interval='confidence')
print(coeff2)
exucp.predict = cbind(predicted=predict(m2, data), actual=data$Effort_Real)
print("predicted values")
print(exucp.predict)

saveRDS(cor2, "./statistical_models/exucp_linear_model_cor.rds")
saveRDS(m2, "./statistical_models/exucp_linear_model.rds")

#correlation between effort and TN
print("correlation between effort and DUCP")
cor3 = cor(data$Effort_Real, data$EXUCP)
print("linear regression of effort on DUCP")
#print(axis1)
m3 = lm(Effort_Real~DUCP, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff3 = summary(m3)$coefficients
summary(m3)$r.squared
newx3 <- seq(-100, max(data$DUCP)+100, length.out=100)
pred3 = predict(m3,data.frame(DUCP=newx3), interval='confidence')
print(coeff3)
ducp.predict = cbind(predicted=predict(m3, data), actual=data$Effort_Real)
print("predicted values")
print(ducp.predict)

saveRDS(cor3, "./statistical_models/ducp_linear_model_cor.rds")
saveRDS(m3, "./statistical_models/ducp_linear_model.rds")

plot = xyplot(Effort_Real~ value | variable, data=useCaseDataMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Software Sizes", fontsize=10),
		ylab=list(label="Effort (man-hours)", fontsize=10),
		strip =strip.custom(factor.levels = c("EUCP","EXUCP","DUCP")),
		scales=list(x=list(relation="free")),
		auto.key = TRUE,
		type = c("p", "r"))

# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename=pngPath,
		type="cairo",
		units="in", 
		width=3*3, 
		height=3*1,
		res=96)
print(plot)

#Create 10 equally size folds
nfold = 4
folds <- cut(seq(1,nrow(useCaseData)),breaks=nfold,labels=FALSE)

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(,nrow=nfold,ncol=12)
colnames(foldResults) <- c('eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50','exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50','ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50')
#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	print('eucp testing set predication')
	eucp.m = lm(Effort_Real~EUCP, data=trainData)
	#eucp.mre = apply(testData, 1, function(x))
	eucp.predict = cbind(predicted=predict(eucp.m, testData), actual=testData$Effort_Real)
	print(eucp.predict)
	eucp.mre = apply(eucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	eucp.mmre = mean(eucp.mre)
	print(eucp.mmre)
	#eucp.preds = sapply(eucp.mre, function(x) calculatePreds(x))
	eucp.pred15 = length(eucp.mre[eucp.mre<=0.15])/length(eucp.mre)
	eucp.pred25 = length(eucp.mre[eucp.mre<=0.25])/length(eucp.mre)
	eucp.pred50 = length(eucp.mre[eucp.mre<=0.50])/length(eucp.mre)
	print(c(eucp.pred15, eucp.pred25, eucp.pred50))
	
	print('exucp testing set predication')
	exucp.m = lm(Effort_Real~EXUCP, data=trainData)
	exucp.predict = cbind(predicted=predict(exucp.m, testData), actual=testData$Effort_Real)
	print(exucp.predict)
	exucp.mre = apply(exucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	exucp.mmre = mean(exucp.mre)
	print(exucp.mmre)
	#exucp.preds = sapply(exucp.mre, function(x) calculatePreds(x))
	exucp.pred15 = length(exucp.mre[exucp.mre<=0.15])/length(exucp.mre)
	exucp.pred25 = length(exucp.mre[exucp.mre<=0.25])/length(exucp.mre)
	exucp.pred50 = length(exucp.mre[exucp.mre<=0.50])/length(exucp.mre)
	print(c(exucp.pred15, exucp.pred25, exucp.pred50))
	
	print('ducp testing set predication')
	ducp.m = lm(Effort_Real~DUCP, data=trainData)
	ducp.predict = cbind(predicted=predict(ducp.m, testData), actual=testData$Effort_Real)
	print(ducp.predict)
	ducp.mre = apply(ducp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	ducp.mmre = mean(ducp.mre)
	print(ducp.mmre)
	#ducp.preds = sapply(ducp.mre, function(x) calculatePreds(x))
	ducp.pred15 = length(ducp.mre[ducp.mre<=0.15])/length(ducp.mre)
	ducp.pred25 = length(ducp.mre[ducp.mre<=0.25])/length(ducp.mre)
	ducp.pred50 = length(ducp.mre[ducp.mre<=0.50])/length(ducp.mre)
	print(c(ducp.pred15, ducp.pred25, ducp.pred50))
	
	foldResults[i,] = c(eucp.mmre,eucp.pred15,eucp.pred25,eucp.pred50,ducp.mmre,exucp.pred15,exucp.pred25,exucp.pred50,ducp.mmre,ducp.pred15,ducp.pred25,ducp.pred50)
}

#average out the folds.
print('10 cross validation results')
print(foldResults);
cvResults <- c(
		mean(foldResults[, 'eucp_mmre']),
		mean(foldResults[, 'eucp_pred15']),
		mean(foldResults[, 'eucp_pred25']),
		mean(foldResults[, 'eucp_pred50']),
		mean(foldResults[, 'exucp_mmre']),
		mean(foldResults[, 'exucp_pred15']),
		mean(foldResults[, 'exucp_pred25']),
		mean(foldResults[, 'exucp_pred50']),
		mean(foldResults[, 'ducp_mmre']),
		mean(foldResults[, 'ducp_pred15']),
		mean(foldResults[, 'ducp_pred25']),
		mean(foldResults[, 'ducp_pred50'])
);

names(cvResults) <- c('eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50','exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50','ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50')
print(cvResults)


#also have linear regression on sloc and normalized effort.
sink()

# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)

