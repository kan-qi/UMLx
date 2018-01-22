#!/usr/bin/env Rscript

#arg1: data url
#arg2: a priori use case and actor weights
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least 2 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./temp"
}

dataUrl <- args[1]
apriori <- args[2]
outputPath <- args[3]
reportPath <- paste(outputPath,'use-case-point-weight-calibration-report.txt', sep='/')
#linearRegressionPlotPath <- paste(outputPath,'use-case-point-linear-regression-plot.png', sep='/')
#independentVariablesScatterPlotPath <- paste(outputPath,'use-case-point-independent-variable-scatter-plot.png', sep='/')

# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

library(lattice)
#library(latticeExtra)
# set the output file
#library(reshape)
#library(dplyr)

#for draw the density plots

library(ggplot2)
library(data.table)
library(gridExtra)
sink(reportPath)

useCaseData <- read.csv(dataUrl, header=TRUE)
aprioriData <- read.csv(apriori, header=TRUE)

#output the project descriptive data for number valued data
png(filename=paste(outputPath,"project_descriptive_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=3*2, 
		pointsize=12,
		res=96)

projectHist1 <- ggplot(useCaseData, aes(x=Real_Effort_Person_Hours))+geom_histogram(binwidth=350, colour="black", fill="white")+xlab("Effort (person-hours)")+ylab("Count")
projectHist2 <- ggplot(useCaseData, aes(x=KSLOC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("KSLOC")+ylab("Count")
projectHist3 <- ggplot(useCaseData, aes(x=Use_Case_Num))+geom_histogram(binwidth=2, colour="black", fill="white")+xlab("Use Case Num")+ylab("Count")
projectBar <- ggplot(useCaseData, aes(x=Application_Type))+geom_bar(colour="black", fill="white")+xlab("Application Type")+ylab("Count")+ scale_x_discrete(label=abbreviate)
print(grid.arrange(projectHist1, projectHist2, projectHist3, projectBar, ncol=2))

#output the use case related statistics

png(filename=paste(outputPath,"project_counting_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=3*3, 
		pointsize=12,
		res=96)

UCPHist1 <- ggplot(useCaseData, aes(x=UAW))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("UAW")+ylab("Count")
UCPHist2 <- ggplot(useCaseData, aes(x=UUCW))+geom_histogram(binwidth=10, colour="black", fill="white")+xlab("UUCW")+ylab("Count")
UCPHist3 <- ggplot(useCaseData, aes(x=TCF))+geom_histogram(binwidth=0.02, colour="black", fill="white")+xlab("TCF")+ylab("Count")
UCPHist4 <- ggplot(useCaseData, aes(x=EF))+geom_histogram(binwidth=0.02, colour="black", fill="white")+xlab("EF")+ylab("Count")
UCPHist5 <- ggplot(useCaseData, aes(x=UCP))+geom_histogram(binwidth=10, colour="black", fill="white")+xlab("UCP")+ylab("Count")

print(grid.arrange(UCPHist1, UCPHist2, UCPHist3, UCPHist4, UCPHist5, ncol=2))

png(filename=paste(outputPath,"project_UC_counting_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*4, 
		height=4*2, 
		pointsize=12,
		res=96)

UCHist1 <- ggplot(useCaseData, aes(x=Simple_UC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("Simple Use Case")+ylab("Count")
UCHist2 <- ggplot(useCaseData, aes(x=Average_UC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("Average Use Case")+ylab("Count")
UCHist3 <- ggplot(useCaseData, aes(x=Complex_UC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("Complex Use Case")+ylab("Count")

print(grid.arrange(UCHist1, UCHist2, UCHist3, ncol=2))

#print out the log transformation item

#output the project descriptive data for number valued data
png(filename=paste(outputPath,"log_transformed_effort_ucp_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=3*1, 
		pointsize=12,
		res=96)

logEffortHist <- ggplot(useCaseData, aes(x=log(Real_Effort_Person_Hours)))+geom_histogram(binwidth=0.1, colour="black", fill="white")+xlab("Log(Effort)")+ylab("Count")
logUCPHist <- ggplot(useCaseData, aes(x=log(UCP)))+geom_histogram(binwidth=0.1, colour="black", fill="white")+xlab("Log(UCP)")+ylab("Count")

print(grid.arrange(logEffortHist, logUCPHist, ncol=2))

#Calcualte the apriroi means and variances
aprioriData <- aprioriData[c("Simple_UC","Average_UC", "Complex_UC")]
aprioriMeans <- cbind(mean(aprioriData[,"Simple_UC"]), mean(aprioriData[,"Average_UC"]), mean(aprioriData[,"Complex_UC"]))
colnames(aprioriMeans) <- c("Simple_UC", "Average_UC", "Complex_UC")
print('apriori means')
print(aprioriMeans)

print('apriori variance')
aprioriVariance = cbind(var(aprioriData[,'Simple_UC']),var(aprioriData[,'Average_UC']),var(aprioriData[,'Complex_UC']))
colnames(aprioriVariance) = c('Simple_UC', 'Average_UC', 'Complex_UC')
print(aprioriVariance)

#log transformation for the data needed.
#useCaseDataLog = data.frame(col1=as.numeric(log(useCaseData$Real_Effort_Person_Hours)), col2=as.numeric(log(useCaseData$UCP)))
useCaseData$Real_Effort_Person_Hours_log = log(useCaseData$Real_Effort_Person_Hours)
useCaseData$UCP_log = log(useCaseData$UCP)

# clibrate between the UCP and effort to get the normalizing factor
ucpFit <- lm(Real_Effort_Person_Hours_log ~ UCP_log - 1, data = useCaseData)
normFactor <- exp(coef(ucpFit)[c('UCP_log')])
print("norm factor")
print(normFactor)

print("normalized UUCW")
normUUCW <- useCaseData[,'Real_Effort_Person_Hours']/(useCaseData[,'TCF']*useCaseData[,'EF']*normFactor)
print(normUUCW)
useCaseData$norm_UUCW = normUUCW


#print("log transformation of the data")
useCaseData$Norm_UUCW_log = log(normUUCW)
useCaseData$Simple_UC_log = log(useCaseData$Simple_UC)
useCaseData$Simple_UC_log[is.infinite(useCaseData$Simple_UC_log)] <- 0
useCaseData$Average_UC_log = log(useCaseData$Average_UC)
useCaseData$Average_UC_log[is.infinite(useCaseData$Average_UC_log)] <- 0
useCaseData$Complex_UC_log = log(useCaseData$Complex_UC)
useCaseData$Complex_UC_log[is.infinite(useCaseData$Complex_UC_log)] <- 0


png(filename=paste(outputPath,"log_transformed_uc_and_uucw_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=3*2, 
		pointsize=12,
		res=96)

simple_uc_plot <- ggplot(useCaseData, aes(x=log(Simple_UC)))+geom_histogram(binwidth=0.1, colour="black", fill="white")+xlab("log(Simple Use Case)")+ylab("Count")
average_uc_plot <- ggplot(useCaseData, aes(x=log(Average_UC)))+geom_histogram(binwidth=0.1, colour="black", fill="white")+xlab("log(Average Use Case)")+ylab("Count")
complex_uc_plot <- ggplot(useCaseData, aes(x=log(Complex_UC)))+geom_histogram(binwidth=0.1, colour="black", fill="white")+xlab("log(Complex Use Case)")+ylab("Count")
uucw_log_plot <- ggplot(useCaseData, aes(x=Norm_UUCW_log))+geom_histogram(binwidth=0.1, colour="black", fill="white")+xlab("log(Norm UUCW)")+ylab("Count")


print(grid.arrange(simple_uc_plot, average_uc_plot, complex_uc_plot, uucw_log_plot, ncol=2))


#print(useCaseData)
#print('covariance matrix for apriori data')
#print(cor(aprioriData))
print('variance-covariance matrix for apriori data')
print(var(aprioriData))
#print(c(var(aprioriData$Simple_UC),var(aprioriData$Average_UC), var(aprioriData$Complex_UC)))
#print("apriori w1")
#w1 <- solve(var(aprioriData))
#print(w1)

#print("apriori variance")
#aprioriVariance <- c(var(aprioriData$Simple_UC),var(aprioriData$Average_UC), var(aprioriData$Complex_UC))
#colnames(aprioriVariance) <- c("Simple_UC", "Average_UC", "Complex_UC")
#print(aprioriVariance)

print("apriori w1")
w1 <- 1/aprioriVariance
print(w1)

# calculate the precision matrix for the apriori information
#c1 <- w1 %*% as.matrix(t(aprioriMeans))
print('weighted apriori calibrated parameters')
c1 <- w1*aprioriMeans
print(c1)


fit <- lm(Norm_UUCW_log ~ Simple_UC_log + Average_UC_log + Complex_UC_log, data=useCaseData)

print("regression residual variance")
logResVariance <- var(resid(fit))
print(logResVariance)
#w2 <- t(useCaseDataX) %*% as.matrix(useCaseDataX) / logResVariance #the variance generated by the normal linear regression
#regressionVariance <- solve(w2)

print("regression variance")
useCaseDataX <- useCaseData[c("Simple_UC_log","Average_UC_log", "Complex_UC_log")]	
logRegVariance <- logResVariance * solve(t(useCaseDataX) %*% as.matrix(useCaseDataX))
logRegVariance <- c(logRegVariance["Simple_UC_log", "Simple_UC_log"], logRegVariance["Average_UC_log", "Average_UC_log"], logRegVariance["Complex_UC_log", "Complex_UC_log"])
#print(logRegVariance)
print(logRegVariance)

#bias <- coefs[c("(Intercept)")]
print('exp regression parameters')
coefs <- coef(fit)
coefs <- exp(coefs[c("Simple_UC_log","Average_UC_log", "Complex_UC_log")])*(1+logRegVariance/2);
regressionCoefs <- t(as.matrix(coefs))
#regressionCoefs = cbind(coefs[c("Simple_UC_log")], coefs[c("Average_UC_log")], coefs[c("Complex_UC_log")])
colnames(regressionCoefs) <- c("Simple_UC", "Average_UC", "Complex_UC")
print(regressionCoefs)

print("exp regression variance")
regressionVariance <- t(as.matrix((coefs^2)*logRegVariance));
colnames(regressionVariance) <- c("Simple_UC", "Average_UC", "Complex_UC")
#regressionVariance$Simple_UC = expVariance$Simple_UC_log
#regressionVariance$Average_UC = expVariance$Average_UC_log
#regressionVariance$Complex_UC = expVariance$Complex_UC_log
print(regressionVariance)

print("regression w2")
w2 <- 1/regressionVariance
print(w2)
print('weighted regression calibrated parameters')
c2 <- w2*regressionCoefs
print(c2)


print("w1+w2")
print(1/(w1+w2))

print("c1+c2")
print(c1+c2)


print('bayesian averaged coefficients')
#averageCoefs = solve(w1+w2) %*% (c1 + c2)
averageCoefs = (1/(w1+w2))*(c1+c2)
print(averageCoefs)

print('bayesian variance')
bayesianVariance = 1/(w1+w2)
print(bayesianVariance)
#print(bias)

#bayesianModel <- as.formula("norm_UUCW ~ 5*Simple_UC + 10*Average_UC + 15*Complex_UC")
#print(predict(eval(bayesianModel), useCaseDataX))

#print(by(useCaseDataX, 1:nrow(useCaseDataX), function(row) row * averageCoefs))

print("comparison between the means")
print(averageCoefs)
print(regressionCoefs)
aprioriMeans = cbind(Simple_UC=5, Average_UC=10, Complex_UC=25)
print(aprioriMeans)

useCaseDataSet <-  useCaseData[c("Simple_UC","Average_UC", "Complex_UC")]	
bayesianPredictedUUCW <- as.matrix(useCaseDataSet) %*% t(averageCoefs)
testRegressionCoefs <- coef(fit)
print("test regression coefs")
print(testRegressionCoefs)
print(cbind(useCaseDataSet, 1))
regressionPredictedUUCW <- as.matrix(useCaseDataSet) %*% t(regressionCoefs)
aprioriPredictedUUCW <- as.matrix(useCaseDataSet) %*% t(aprioriMeans)
actualUUCW <- useCaseData[,"norm_UUCW"]
regressionResidual <- abs(regressionPredictedUUCW - actualUUCW)
bayesianResidual <- abs(bayesianPredictedUUCW - actualUUCW)
aprioriResidual <- abs(aprioriPredictedUUCW - actualUUCW)
output <- cbind(useCaseDataSet[c("Simple_UC","Average_UC", "Complex_UC")], bayesianPredictedUUCW, regressionPredictedUUCW, aprioriPredictedUUCW, actualUUCW, bayesianResidual, regressionResidual, aprioriResidual)
colnames(output) <- c("UC_Simple", "UC_Average", "UC_Complex", "bayesian", "regression", "apriori", "actual", "bayesian_residual", "regression_residual", "apriori_residual")
print(output)
print("residual sum of squares")
print(cbind(regression_rrs=sum(regressionResidual^2), bayesian_rrs=sum(bayesianResidual^2), apriori_rrs=sum(aprioriResidual^2)))
print("regression mmre")
print(mean(regressionResidual))
print("bayesian mmre")
print(mean(bayesianResidual))
print("apriori mmre")
print(mean(aprioriResidual))

print(summary(fit))

#draw the density flots

#Simple use case bayesian averaging plot
dat1 <- data.frame(dens1 = c(rnorm(100, aprioriMeans[,'Simple_UC'], aprioriVariance[,'Simple_UC']), rnorm(100, regressionCoefs[,'Simple_UC'], regressionVariance[1, 'Simple_UC']),rnorm(100, averageCoefs[1,'Simple_UC'], bayesianVariance[1, 'Simple_UC']))
		, lines1 = rep(c("A-Priori", "Regression", "Bayesian"), each = 100))
print("data frame 1")
print(dat1)
svg(paste(outputPath,"simple_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
simplePlot <- ggplot(dat1, aes(x = dens1, fill = lines1)) + geom_density(alpha = 0.5)+labs(x="Simple Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(0:8)))
print(simplePlot)

#Average use case bayesian averaging plot
dat2 <- data.frame(dens2 = c(rnorm(100, aprioriMeans[,'Average_UC'], aprioriVariance[,'Average_UC']), rnorm(100, regressionCoefs[,'Average_UC'], regressionVariance[1, 'Average_UC']),rnorm(100, averageCoefs[1,'Average_UC'], bayesianVariance[1, 'Average_UC']))
		, lines2 = rep(c("A-Priori", "Regression", "Bayesian"), each = 100))
svg(paste(outputPath,"average_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
averagePlot <- ggplot(dat2, aes(x = dens2, fill = lines2)) + geom_density(alpha = 0.5)+labs(x="Average Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-10:20)))
print(averagePlot)

#Complex use case bayesian averaging plot
dat3 <- data.frame(dens3 = c(rnorm(100, aprioriMeans[,'Complex_UC'], aprioriVariance[,'Complex_UC']), rnorm(100, regressionCoefs[,'Complex_UC'], regressionVariance[1, 'Complex_UC']),rnorm(100, averageCoefs[1,'Complex_UC'], bayesianVariance[1, 'Complex_UC']))
		, lines3 = rep(c("A-Priori", "Regression", "Bayesian"), each = 100))
svg(paste(outputPath,"complex_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
complexPlot <- ggplot(dat3, aes(x = dens3, fill = lines3)) + geom_density(alpha = 0.5)+labs(x="Complex Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-10:30)))
print(complexPlot)

#print("output dat")
#combDat <- cbind(dat1, dat2, dat3)
svg(paste(outputPath,"combined_use_case_bayesian_average_plot.svg", sep="/"), width=5, height=8.5)
#print(ggplot(combDat)+geom_density(alpha = 0.5,aes(x = dens1, fill = lines1)+geom_density(alpha = 0.5,aes(x = dens2, fill = lines2))+geom_density(alpha = 0.5,aes(x = dens3, fill = lines3))))

g_legend<-function(a.gplot){
	tmp <- ggplot_gtable(ggplot_build(a.gplot))
	leg <- which(sapply(tmp$grobs, function(x) x$name) == "guide-box")
	legend <- tmp$grobs[[leg]]
	return(legend)}

mylegend<-g_legend(simplePlot+ theme(legend.position="bottom"))

print(grid.arrange(arrangeGrob(simplePlot+guides(fill=FALSE), averagePlot+guides(fill=FALSE), complexPlot+guides(fill=FALSE), ncol=1), mylegend,nrow=2, heights=c(8, 1)))

# 10 fold cross validation of mmre, pred(.25), pred(.50)
# estimate the predication accuracy by n fold cross validation.
#Randomly shuffle the data
useCaseData<-useCaseData[sample(nrow(useCaseData)),]
#Create 10 equally size folds
nfold = 20
folds <- cut(seq(1,nrow(useCaseData)),breaks=nfold,labels=FALSE)

#function
#calculatePreds <- function(mre)
#{
#	pred15 = 0;
#	if (mre <= 0.15){
#		pred15 = 1;
#	}
#	pred25 = 0;
#	if (mre <= 0.25){
#		pred25 = 1;
#	}
#	pred50 = 0;
#	if (mre <= 0.50){
#		pred50 = 1;
#	}
#	return(c(pred15, pred25, pred50))
#}

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(,nrow=nfold,ncol=12)
colnames(foldResults) <- c('bayesian_mmre','bayesian_pred15','bayesian_pred25','bayesian_pred50','apriori_mmre','apriori_pred15','apriori_pred25','apriori_pred50','regression_mmre','regression_pred15','regression_pred25','regression_pred50')
#data structure to hold
foldResults1 <- array(0,dim=c(100,3,nfold))
#colnames(foldResults1) <- c('baye_pred','apriori_pred','regression_pred')
#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	testDataX <- testData[c("Simple_UC","Average_UC", "Complex_UC")]
	trainDataX <- trainData[c("Simple_UC","Average_UC", "Complex_UC")]
	logTrainDataX <- trainData[c("Norm_UUCW_log", "Simple_UC_log","Average_UC_log", "Complex_UC_log")]	
	logTestDataX <- testData[c("Norm_UUCW_log", "Simple_UC_log","Average_UC_log", "Complex_UC_log")]
	
	
	print('calculate regression parameters')
	
	foldFit <- lm(Norm_UUCW_log ~ Simple_UC_log + Average_UC_log + Complex_UC_log - 1, data=logTrainDataX)
	
	print("regression residual variance")
	foldLogResVariance <- var(resid(foldFit))
	print(foldLogResVariance)
#w2 <- t(useCaseDataX) %*% as.matrix(useCaseDataX) / foldLogResVariance #the variance generated by the normal linear regression
#regressionVariance <- solve(w2)
	
	print("regression variance")
#	useCaseDataX <- useCaseData[c("Simple_UC_log","Average_UC_log", "Complex_UC_log")]	
	foldLogRegVariance <- foldLogResVariance * solve(t(logTrainDataX) %*% as.matrix(logTrainDataX))
	foldLogRegVariance <- c(foldLogRegVariance["Simple_UC_log", "Simple_UC_log"], foldLogRegVariance["Average_UC_log", "Average_UC_log"], foldLogRegVariance["Complex_UC_log", "Complex_UC_log"])
#print(foldLogRegVariance)
	print(foldLogRegVariance)
	
#bias <- coefs[c("(Intercept)")]
	print('fold regression parameters')
	foldCoefs <- coef(foldFit)
	foldCoefs <- exp(foldCoefs[c("Simple_UC_log","Average_UC_log", "Complex_UC_log")])*(1+foldLogRegVariance/2);
	foldRegressionCoefs <- t(as.matrix(foldCoefs))
#foldRegressionCoefs = cbind(foldCoefs[c("Simple_UC_log")], foldCoefs[c("Average_UC_log")], foldCoefs[c("Complex_UC_log")])
	colnames(foldRegressionCoefs) <- c("Simple_UC", "Average_UC", "Complex_UC")
	print(foldRegressionCoefs)
	
	print("fold regression variance")
	foldRegressionVariance <- t(as.matrix((foldCoefs^2)*foldLogRegVariance));
	colnames(foldRegressionVariance) <- c("Simple_UC", "Average_UC", "Complex_UC")
#foldRegressionVariance$Simple_UC = expVariance$Simple_UC_log
#foldRegressionVariance$Average_UC = expVariance$Average_UC_log
#foldRegressionVariance$Complex_UC = expVariance$Complex_UC_log
	print(foldRegressionVariance)
	
	print("regression w2")
	foldW2 <- 1/foldRegressionVariance
	print(foldW2)
	print('weighted regression calibrated parameters')
	foldC2 <- foldW2*foldRegressionCoefs
	print(foldC2)
	
	print("calculate fold averaged coefficients")
	
	foldAverageCoefs = (1/(w1+foldW2)) * (c1 + foldC2)
	print("foldAverageCoefs")
	print(foldAverageCoefs)
	
	#bayesian.mre = apply(testData, 1, function(x))
	bayesian.predict = cbind(as.matrix(testDataX) %*% t(foldAverageCoefs), testData$norm_UUCW)
	colnames(bayesian.predict) = c('predicted', "actual")
	print(bayesian.predict)
	bayesian.mre = apply(bayesian.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	bayesian.mmre = mean(bayesian.mre)
	print(bayesian.mmre)
	#bayesian.preds = sapply(bayesian.mre, function(x) calculatePreds(x))
	bayesian.pred15 = length(bayesian.mre[bayesian.mre<=0.15])/length(bayesian.mre)
	bayesian.pred25 = length(bayesian.mre[bayesian.mre<=0.25])/length(bayesian.mre)
	bayesian.pred50 = length(bayesian.mre[bayesian.mre<=0.50])/length(bayesian.mre)
	print(c(bayesian.pred15, bayesian.pred25, bayesian.pred50))
	
	bayesian.pred <- 0
	for(j in 1:99){
		bayesian.pred <- c(bayesian.pred, length(bayesian.mre[bayesian.mre<=0.01*j])/length(bayesian.mre))
	}
	
	print('apriori testing set predication')
	testDataDesignMatrix = testData[c("Simple_UC","Average_UC", "Complex_UC")]
	aprioriMeans = cbind(Simple_UC=5, Average_UC=10, Complex_UC=15)
	apriori.predict = cbind(as.matrix(testDataX) %*% t(aprioriMeans), testData$norm_UUCW)
	colnames(apriori.predict) = c('predicted', "actual")
	print(apriori.predict)
	apriori.mre = apply(apriori.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	apriori.mmre = mean(apriori.mre)
	print(apriori.mmre)
	#apriori.preds = sapply(apriori.mre, function(x) calculatePreds(x))
	apriori.pred15 = length(apriori.mre[apriori.mre<=0.15])/length(apriori.mre)
	apriori.pred25 = length(apriori.mre[apriori.mre<=0.25])/length(apriori.mre)
	apriori.pred50 = length(apriori.mre[apriori.mre<=0.50])/length(apriori.mre)
	print(c(apriori.pred15, apriori.pred25, apriori.pred50))
	
	apriori.pred <- 0
	for(j in 1:99){
		apriori.pred <- c(apriori.pred, length(apriori.mre[apriori.mre<=0.01*j])/length(apriori.mre))
	}
	
	print('regression testing set predication')
	#regression.m = lm(norm_UUCW ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	#regression.m <- lm(Norm_UUCW_log ~ Simple_UC_log + Average_UC_log + Complex_UC_log - 1, data=logTrainDataX)
	regression.predict = cbind(predicted=as.matrix(testDataX) %*% t(foldRegressionCoefs), actual=testData$norm_UUCW)
	print(regression.predict)
	regression.mre = apply(regression.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	regression.mmre = mean(regression.mre)
	print(regression.mmre)
	#regression.preds = sapply(regression.mre, function(x) calculatePreds(x))
	regression.pred15 = length(regression.mre[regression.mre<=0.15])/length(regression.mre)
	regression.pred25 = length(regression.mre[regression.mre<=0.25])/length(regression.mre)
	regression.pred50 = length(regression.mre[regression.mre<=0.50])/length(regression.mre)
	print(c(regression.pred15, regression.pred25, regression.pred50))
	
	regression.pred <- 0
	for(j in 1:99){
		regression.pred <- c(regression.pred, length(regression.mre[regression.mre<=0.01*j])/length(regression.mre))
	}
	
	
	foldResults[i,] = c(bayesian.mmre,bayesian.pred15,bayesian.pred25,bayesian.pred50,apriori.mmre,apriori.pred15,apriori.pred25,apriori.pred50,regression.mmre,regression.pred15,regression.pred25,regression.pred50)
	foldResults1[,,i] = array(c(bayesian.pred, apriori.pred, regression.pred),c(100,3))
	
}

#average out the folds.
print('n fold cross validation results')
print(foldResults);
cvResults <- c(
		mean(foldResults[, 'bayesian_mmre']),
		mean(foldResults[, 'bayesian_pred15']),
		mean(foldResults[, 'bayesian_pred25']),
		mean(foldResults[, 'bayesian_pred50']),
		mean(foldResults[, 'apriori_mmre']),
		mean(foldResults[, 'apriori_pred15']),
		mean(foldResults[, 'apriori_pred25']),
		mean(foldResults[, 'apriori_pred50']),
		mean(foldResults[, 'regression_mmre']),
		mean(foldResults[, 'regression_pred15']),
		mean(foldResults[, 'regression_pred25']),
		mean(foldResults[, 'regression_pred50'])
);

names(cvResults) <- c('bayesian_mmre','bayesian_pred15','bayesian_pred25','bayesian_pred50','apriori_mmre','apriori_pred15','apriori_pred25','apriori_pred50','regression_mmre','regression_pred15','regression_pred25','regression_pred50')
print(cvResults)

for(i in 1:nfold){
	#print(foldResults1[,,i])
}
avgPreds <- matrix(,nrow=100,ncol=4)
colnames(avgPreds) <- c("Pred","Bayesian","A Priori","Regression")
for(i in 1:100){
	avgPreds[i,] <- c(i, mean(foldResults1[i,1,]),mean(foldResults1[i,2,]),mean(foldResults1[i,3,]))
	#print(i)
	#print(avgPreds[i,])
}

avgPreds <- data.frame(avgPreds)
print(avgPreds)
meltAvgPreds = melt(avgPreds, id.vars="Pred", value.name="Value", variable.name="Method")
print("melt avg preds info")
print(meltAvgPreds)
svg(paste(outputPath,"use_case_weight_calibration_err_plot.svg", sep="/"), width=6, height=4)
print(ggplot(meltAvgPreds) + geom_point(aes(x=Pred, y=Value, group=Method,color=Method),size=3)+ xlab("Relative Deviation (%)") +
				ylab("Percentage")+ theme(legend.position="bottom"))

print("melt avg preds info as lines and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_lines_smooth.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + 
		geom_line(aes(y=Value, x=Pred, group=Method,color=Method)) +
		stat_smooth(aes(y=Value, x=Pred, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")


print("melt avg preds info as dots and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_dots_smooth.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + 
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method,shape=Method),size=1.5) +
		scale_shape_manual(values=c(0,1,2))+
		stat_smooth(aes(x=Pred, y=Value, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")


#also have linear regression on sloc and normalized effort.
sink()

