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

projectHist1 <- ggplot(useCaseData, aes(x=Real_Effort_Person_Hours))+geom_histogram(binwidth=350, colour="white", fill="gray55")+xlab("Effort (person-hours)")+ylab("Number of Projects")+theme_bw()
projectHist2 <- ggplot(useCaseData, aes(x=KSLOC))+geom_histogram(binwidth=1, colour="white", fill="gray55")+xlab("KSLOC")+ylab("Number of Projects")+theme_bw()
projectHist3 <- ggplot(useCaseData, aes(x=Use_Case_Num))+geom_histogram(binwidth=2, colour="white", fill="gray55")+xlab("Use Case Num")+ylab("Number of Projects")+theme_bw()
projectBar <- ggplot(useCaseData, aes(x=Application_Type))+geom_bar(colour="white", fill="gray55")+xlab("Application Type")+ylab("Number of Projects")+ scale_x_discrete(label=abbreviate)+theme_bw()
print(grid.arrange(projectHist1, projectHist2, projectHist3, projectBar, ncol=2))

#output the use case related statistics

png(filename=paste(outputPath,"project_counting_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=3*2, 
		height=2*3, 
		pointsize=12,
		res=96)

UCPHist1 <- ggplot(useCaseData, aes(x=UAW))+geom_histogram(binwidth=1.2, colour="white", fill="gray55")+xlab("UAW")+ylab("Number of Projects")+theme_bw()
UCPHist2 <- ggplot(useCaseData, aes(x=UUCW))+geom_histogram(binwidth=20, colour="white", fill="gray55")+xlab("UUCW")+ylab("Number of Projects")+theme_bw()
UCPHist3 <- ggplot(useCaseData, aes(x=TCF))+geom_histogram(binwidth=0.05, colour="white", fill="gray55")+xlab("TCF")+ylab("Number of Projects")+theme_bw()
UCPHist4 <- ggplot(useCaseData, aes(x=EF))+geom_histogram(binwidth=0.02, colour="white", fill="gray55")+xlab("EF")+ylab("Number of Projects")+theme_bw()
UCPHist5 <- ggplot(useCaseData, aes(x=UCP))+geom_histogram(binwidth=30, colour="white", fill="gray55")+xlab("UCP")+ylab("Number of Projects")+theme_bw()

print(grid.arrange(UCPHist1, UCPHist2, UCPHist3, UCPHist4, UCPHist5, ncol=2))
print("hello");
png(filename=paste(outputPath,"project_UC_counting_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=3*2, 
		height=2*2, 
		pointsize=12,
		res=96)

UCHist1 <- ggplot(useCaseData, aes(x=Simple_UC))+geom_histogram(binwidth=1.3, colour="white", fill="gray55")+xlab("Simple Use Case")+ylab("Number of Projects")+theme_bw()
UCHist2 <- ggplot(useCaseData, aes(x=Average_UC))+geom_histogram(binwidth=1, colour="white", fill="gray55")+xlab("Average Use Case")+ylab("Number of Projects")+theme_bw()
UCHist3 <- ggplot(useCaseData, aes(x=Complex_UC))+geom_histogram(binwidth=1.1, colour="white", fill="gray55")+xlab("Complex Use Case")+ylab("Number of Projects")+theme_bw()

print(grid.arrange(UCHist1, UCHist2, UCHist3, ncol=2))

png(filename=paste(outputPath,"project_comprehensive_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=3*2, 
		height=2*3, 
		pointsize=12,
		res=96)

print(grid.arrange(UCHist1, UCHist2, UCHist3, projectHist1, projectHist2, projectHist3, ncol=2))

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

print('variance-covariance matrix for apriori data')
print(var(aprioriData))

print("apriori w1")
w1 <- 1/aprioriVariance
print(w1)

# calculate the precision matrix for the apriori information
#c1 <- w1 %*% as.matrix(t(aprioriMeans))
print('weighted apriori calibrated parameters')
c1 <- w1*aprioriMeans
print(c1)


ucpFit <- lm(Real_Effort_Person_Hours ~ UCP - 1, data = useCaseData)
normFactor <- coef(ucpFit)[c('UCP')]
print("norm factor")
#normFactor <- 12
print(normFactor)

print("normalized UUCW")
normUUCW <- useCaseData[,'Real_Effort_Person_Hours']/(useCaseData[,'TCF']*useCaseData[,'EF']*normFactor)
print(normUUCW)
useCaseData$norm_UUCW = normUUCW

fit <- lm(norm_UUCW ~ Simple_UC + Average_UC + Complex_UC-1, data=useCaseData)

print("regression residual variance")
resVariance <- var(resid(fit))
print(resVariance)
#w2 <- t(useCaseDataX) %*% as.matrix(useCaseDataX) / logResVariance #the variance generated by the normal linear regression
#regressionVariance <- solve(w2)

print("regression variance")
useCaseDataX <- useCaseData[c("Simple_UC","Average_UC", "Complex_UC")]	
regVariance <- resVariance * solve(t(useCaseDataX) %*% as.matrix(useCaseDataX))
regressionVariance <- cbind(regVariance["Simple_UC", "Simple_UC"], regVariance["Average_UC", "Average_UC"], regVariance["Complex_UC", "Complex_UC"])
colnames(regressionVariance) <- c("Simple_UC", "Average_UC", "Complex_UC")
#print(logRegVariance)
print(regressionVariance)

print("regression parameters")
coefs <- coef(fit)
regressionCoefs <- coefs[c("Simple_UC","Average_UC", "Complex_UC")];
regressionCoefs <- t(as.matrix(regressionCoefs))
colnames(regressionCoefs) <- c("Simple_UC", "Average_UC", "Complex_UC")
print(regressionCoefs)

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
#bayesianCoefs = solve(w1+w2) %*% (c1 + c2)
bayesianCoefs = (1/(w1+w2))*(c1+c2)
print(bayesianCoefs)

print('bayesian variance')
bayesianVariance = 1/(w1+w2)
print(bayesianVariance)
#print(bias)

#bayesianModel <- as.formula("norm_UUCW ~ 5*Simple_UC + 10*Average_UC + 15*Complex_UC")
#print(predict(eval(bayesianModel), useCaseDataX))

#print(by(useCaseDataX, 1:nrow(useCaseDataX), function(row) row * bayesianCoefs))

print("summary and comparison between the means")
print("bayesian estimates")
print(bayesianCoefs)
print(bayesianVariance)
print("regression estimates")
print(regressionCoefs)
print(regressionVariance)
#aprioriMeans = cbind(Simple_UC=5, Average_UC=10, Complex_UC=25)
print("apriori estimates")
print(aprioriMeans)
print(aprioriVariance)

useCaseDataSet <-  useCaseData[c("Simple_UC","Average_UC", "Complex_UC")]	
bayesianPredictedUUCW <- as.matrix(useCaseDataSet) %*% t(bayesianCoefs)
#testRegressionCoefs <- coef(fit)
#print("test regression coefs")
#print(testRegressionCoefs)
#print(cbind(useCaseDataSet, 1))
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
dat1 <- data.frame(dens1 = c(rnorm(100, aprioriMeans[,'Simple_UC'], aprioriVariance[,'Simple_UC']), rnorm(100, regressionCoefs[,'Simple_UC'], regressionVariance[1, 'Simple_UC']),rnorm(100, bayesianCoefs[1,'Simple_UC'], bayesianVariance[1, 'Simple_UC']))
		, lines1 = rep(c("A-Priori", "Regression", "Bayesian"), each = 100))
#print("data frame 1")
#print(dat1)
svg(paste(outputPath,"simple_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
simplePlot <- ggplot(dat1, aes(x = dens1, fill = lines1))+geom_density(alpha = 0.5, adjust=1.5)+theme_bw()+labs(x="Simple Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-5, 15)))+theme_bw()
print(simplePlot)

#Average use case bayesian averaging plot
dat2 <- data.frame(dens2 = c(rnorm(100, aprioriMeans[,'Average_UC'], aprioriVariance[,'Average_UC']), rnorm(100, regressionCoefs[,'Average_UC'], regressionVariance[1, 'Average_UC']),rnorm(100, bayesianCoefs[1,'Average_UC'], bayesianVariance[1, 'Average_UC'])), lines2 = rep(c("A-Priori", "Regression", "Bayesian"), each = 100))
svg(paste(outputPath,"average_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
averagePlot <- ggplot(dat2, aes(x = dens2, fill = lines2))+geom_density(alpha = 0.5, adjust=1.5)+theme_bw()+labs(x="Average Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-10:25)))+theme_bw()
print(averagePlot)

#Complex use case bayesian averaging plot
dat3 <- data.frame(dens3 = c(rnorm(100, aprioriMeans[,'Complex_UC'], aprioriVariance[,'Complex_UC']), rnorm(100, regressionCoefs[,'Complex_UC'], regressionVariance[1, 'Complex_UC']),rnorm(100, bayesianCoefs[1,'Complex_UC'], bayesianVariance[1, 'Complex_UC'])), lines3 = rep(c("A-Priori", "Regression", "Bayesian"), each = 100))
svg(paste(outputPath,"complex_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
complexPlot <- ggplot(dat3, aes(x = dens3, fill = lines3))+geom_density(alpha = 0.5, adjust=1.5)+theme_bw()+labs(x="Complex Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-5:35)))+theme_bw()
print(complexPlot)

#print("output dat")
#combDat <- cbind(dat1, dat2, dat3)
#print horizontal diagrams
svg(paste(outputPath,"combined_use_case_bayesian_average_horizontal_plot.svg", sep="/"), width=8.5, height=2.5)
#print(ggplot(combDat)+geom_density(alpha = 0.5,aes(x = dens1, fill = lines1)+geom_density(alpha = 0.5,aes(x = dens2, fill = lines2))+geom_density(alpha = 0.5,aes(x = dens3, fill = lines3))))

g_legend<-function(a.gplot){
	tmp <- ggplot_gtable(ggplot_build(a.gplot))
	leg <- which(sapply(tmp$grobs, function(x) x$name) == "guide-box")
	legend <- tmp$grobs[[leg]]
	return(legend)}

mylegend<-g_legend(simplePlot+ theme(legend.position="bottom"))

print(grid.arrange(arrangeGrob(simplePlot+guides(fill=FALSE), averagePlot+guides(fill=FALSE), complexPlot+guides(fill=FALSE), ncol=3), mylegend,nrow=2, heights=c(4, 1)))

#print vitical diagrams

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
nfold = 10
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
foldResults <- matrix(,nrow=nfold,ncol=16)
colnames(foldResults) <- c('bayesian_mmre','bayesian_pred15','bayesian_pred25','bayesian_pred50','apriori_mmre','apriori_pred15','apriori_pred25','apriori_pred50','original_mmre','original_pred15','original_pred25','original_pred50','regression_mmre','regression_pred15','regression_pred25','regression_pred50')
#data structure to hold
foldResults1 <- array(0,dim=c(100,4,nfold))
#colnames(foldResults1) <- c('baye_pred','apriori_pred','regression_pred')
#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	testDataX <- testData[c("Simple_UC","Average_UC", "Complex_UC")]
	trainDataX <- trainData[c("Simple_UC","Average_UC", "Complex_UC")]
	#trainDataX <- trainData[c("Norm_UUCW", "Simple_UC","Average_UC", "Complex_UC")]	
	#logTestDataX <- testData[c("Norm_UUCW", "Simple_UC","Average_UC", "Complex_UC")]
	
	
	print('calculate regression parameters')
	
	foldTrainingUCPFit <- lm(Real_Effort_Person_Hours ~ UCP - 1, data = trainData)
	foldTrainNormFactor <- coef(foldTrainingUCPFit)[c('UCP')]
	print("fold norm factor")
#normFactor <- 12
	print(foldTrainNormFactor)
	
	print("normalized UUCW")
	foldTrainNormUUCW <- trainData[,'Real_Effort_Person_Hours']/(trainData[,'TCF']*trainData[,'EF']*foldTrainNormFactor)
	print(foldTrainNormUUCW)
	trainData$fold_train_norm_UUCW = foldTrainNormUUCW
	
	foldFit <- lm(fold_train_norm_UUCW ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	
	print("regression residual variance")
	foldResVariance <- var(resid(foldFit))
	print(foldResVariance)
#w2 <- t(useCaseDataX) %*% as.matrix(useCaseDataX) / foldResVariance #the variance generated by the normal linear regression
#regressionVariance <- solve(w2)
	
	print("regression variance")
#	useCaseDataX <- useCaseData[c("Simple_UC","Average_UC", "Complex_UC")]	
	foldRegVariance <- foldResVariance * solve(t(trainDataX) %*% as.matrix(trainDataX))
	foldRegressionVariance <- cbind(foldRegVariance["Simple_UC", "Simple_UC"], foldRegVariance["Average_UC", "Average_UC"], foldRegVariance["Complex_UC", "Complex_UC"])
	colnames(foldRegressionVariance) <- c("Simple_UC", "Average_UC", "Complex_UC")
#print(foldRegVariance)
	print(foldRegressionVariance)
	
#bias <- coefs[c("(Intercept)")]
	print('fold regression parameters')
	foldCoefs <- coef(foldFit)
	foldCoefs <- foldCoefs[c("Simple_UC","Average_UC", "Complex_UC")];
	foldRegressionCoefs <- t(as.matrix(foldCoefs))
#foldRegressionCoefs = cbind(foldCoefs[c("Simple_UC")], foldCoefs[c("Average_UC")], foldCoefs[c("Complex_UC")])
	colnames(foldRegressionCoefs) <- c("Simple_UC", "Average_UC", "Complex_UC")
	print(foldRegressionCoefs)
	
	#print("fold regression variance")
	#foldRegressionVariance <- t(as.matrix((foldCoefs^2)*foldRegVariance));
	#colnames(foldRegressionVariance) <- c("Simple_UC", "Average_UC", "Complex_UC")
#foldRegressionVariance$Simple_UC = expVariance$Simple_UC
#foldRegressionVariance$Average_UC = expVariance$Average_UC
#foldRegressionVariance$Complex_UC = expVariance$Complex_UC
	#print(foldRegressionVariance)
	
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
	
	print('calculate fold testing norm factor')
	
	foldTestingUCPFit <- lm(Real_Effort_Person_Hours ~ UCP - 1, data = testData)
	foldTestingNormFactor <- coef(foldTestingUCPFit)[c('UCP')]
	print("fold testing norm factor")
#normFactor <- 12
	print(foldTestingNormFactor)
	
	print("normalized UUCW")
	foldTestNormUUCW <- testData[,'Real_Effort_Person_Hours']/(testData[,'TCF']*testData[,'EF']*foldTestingNormFactor)
	print(foldTestNormUUCW)
	testData$fold_test_norm_UUCW = foldTestNormUUCW
	
	print('bayesian testing set predication')
	#bayesian.mre = apply(testData, 1, function(x))
	bayesian.predict = cbind(as.matrix(testDataX) %*% t(foldAverageCoefs), testData$fold_test_norm_UUCW)
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
	#aprioriMeans = cbind(Simple_UC=5, Average_UC=15, Complex_UC=20)
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
	
	print('original use case weights testing set predication')
	testDataDesignMatrix = testData[c("Simple_UC","Average_UC", "Complex_UC")]
	originalWeights = cbind(Simple_UC=5, Average_UC=10, Complex_UC=15)
	original.predict = cbind(as.matrix(testDataX) %*% t(originalWeights), testData$norm_UUCW)
	colnames(original.predict) = c('predicted', "actual")
	print(original.predict)
	original.mre = apply(original.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	original.mmre = mean(original.mre)
	print(original.mmre)
	#original.preds = sapply(original.mre, function(x) calculatePreds(x))
	original.pred15 = length(original.mre[original.mre<=0.15])/length(original.mre)
	original.pred25 = length(original.mre[original.mre<=0.25])/length(original.mre)
	original.pred50 = length(original.mre[original.mre<=0.50])/length(original.mre)
	print(c(original.pred15, original.pred25, original.pred50))
	
	original.pred <- 0
	for(j in 1:99){
		original.pred <- c(original.pred, length(original.mre[original.mre<=0.01*j])/length(original.mre))
	}
	
	print('regression testing set predication')
	#regression.m = lm(norm_UUCW ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	#regression.m <- lm(Norm_UUCW ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainDataX)
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
	
	
	foldResults[i,] = c(bayesian.mmre,bayesian.pred15,bayesian.pred25,bayesian.pred50,apriori.mmre,apriori.pred15,apriori.pred25,apriori.pred50,original.mmre,original.pred15,original.pred25,original.pred50,regression.mmre,regression.pred15,regression.pred25,regression.pred50)
	foldResults1[,,i] = array(c(bayesian.pred, apriori.pred, original.pred, regression.pred),c(100,4))
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
		mean(foldResults[, 'original_mmre']),
		mean(foldResults[, 'original_pred15']),
		mean(foldResults[, 'original_pred25']),
		mean(foldResults[, 'original_pred50']),
		mean(foldResults[, 'regression_mmre']),
		mean(foldResults[, 'regression_pred15']),
		mean(foldResults[, 'regression_pred25']),
		mean(foldResults[, 'regression_pred50'])
);

names(cvResults) <- c('bayesian_mmre','bayesian_pred15','bayesian_pred25','bayesian_pred50','apriori_mmre','apriori_pred15','apriori_pred25','apriori_pred50','original_mmre','original_pred15','original_pred25','original_pred50','regression_mmre','regression_pred15','regression_pred25','regression_pred50')
print(cvResults)


#for(i in 1:nfold){
	#print(foldResults1[,,i])
#}

avgPreds <- matrix(,nrow=100,ncol=5)
colnames(avgPreds) <- c("Pred","Bayesian","A Priori","Original", "Regression")
for(i in 1:100){
	bayesian_fold_mean = mean(foldResults1[i,1,]);
	a_priori_fold_mean = mean(foldResults1[i,2,]);
	original_fold_mean = mean(foldResults1[i,3,]);
	regression_fold_mean = mean(foldResults1[i,4,]);
	avgPreds[i,] <- c(i,bayesian_fold_mean,a_priori_fold_mean,original_fold_mean,regression_fold_mean)
	#print(i)
	#print(avgPreds[i,])
}

print('average improvement over a priori')
print(mean(avgPreds[, "Bayesian"] - avgPreds[,"A Priori"]))
print('average improvement over original')
print(mean(avgPreds[, "Bayesian"] - avgPreds[,"Original"]))
print('average improvement over regression')
print(mean(avgPreds[, "Bayesian"] - avgPreds[,"Regression"]))

avgPreds <- data.frame(avgPreds)
print(avgPreds)
meltAvgPreds = melt(avgPreds, id.vars="Pred", value.name="Value", variable.name="Method")

print("melt avg preds info")
print(meltAvgPreds)
svg(paste(outputPath,"use_case_weight_calibration_err_plot.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + theme_bw() + 
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method),size=3)+ xlab("Relative Deviation (%)") +
				ylab("Percentage")+ theme(legend.position="bottom")

print("melt avg preds info as lines and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_lines_smooth.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) +theme_bw()+
		geom_line(aes(y=Value, x=Pred, group=Method,color=Method)) +
		stat_smooth(aes(y=Value, x=Pred, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")

print("melt avg preds info as dots and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_dots_smooth.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) +theme_bw()+
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method,shape=Method),size=1.5) +
		scale_shape_manual(values=c(0,1,2,3))+
		stat_smooth(aes(x=Pred, y=Value, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")

#also have linear regression on sloc and normalized effort.
sink()

