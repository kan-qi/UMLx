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
		height=4*2, 
		pointsize=12,
		res=96)
useCaseData$Real_Effort_Person_Hours <- useCaseData$Real_Effort_Person_Hours
#print("log transformation of the data")
#print(useCaseData$Real_Effort_Person_Hours)
projectHist1 <- ggplot(useCaseData, aes(x=Real_Effort_Person_Hours))+geom_histogram(binwidth=100, colour="black", fill="white")+xlab("Effort (person-hours)")+ylab("Count")
projectHist2 <- ggplot(useCaseData, aes(x=KSLOC))+geom_histogram(binwidth=2, colour="black", fill="white")+xlab("KSLOC")+ylab("Count")
projectHist3 <- ggplot(useCaseData, aes(x=Use_Case_Num))+geom_histogram(binwidth=2, colour="black", fill="white")+xlab("Use Case Num")+ylab("Count")
projectBar <- ggplot(useCaseData, aes(x=Application_Type))+geom_bar(colour="black", fill="white")+xlab("Application Type")+ylab("Count")
print(grid.arrange(projectHist1, projectHist2, projectHist3, projectBar, ncol=2))

#output the use case related statistics

png(filename=paste(outputPath,"project_counting_statistics_for_bayesian_analysis.png", sep="/"),
		units="in",
		width=4*4, 
		height=4*2, 
		pointsize=12,
		res=96)

UCPHist1 <- ggplot(useCaseData, aes(x=UAW))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("UAW")+ylab("Count")
UCPHist2 <- ggplot(useCaseData, aes(x=UUCW))+geom_histogram(binwidth=10, colour="black", fill="white")+xlab("UUCW")+ylab("Count")
UCHist1 <- ggplot(useCaseData, aes(x=Simple_UC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("Simple Use Case")+ylab("Count")
UCHist2 <- ggplot(useCaseData, aes(x=Average_UC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("Average Use Case")+ylab("Count")
UCHist3 <- ggplot(useCaseData, aes(x=Complex_UC))+geom_histogram(binwidth=1, colour="black", fill="white")+xlab("Complex Use Case")+ylab("Count")
UCPHist3 <- ggplot(useCaseData, aes(x=TCF))+geom_histogram(binwidth=0.02, colour="black", fill="white")+xlab("TCF")+ylab("Count")
UCPHist4 <- ggplot(useCaseData, aes(x=EF))+geom_histogram(binwidth=0.02, colour="black", fill="white")+xlab("EF")+ylab("Count")
UCPHist5 <- ggplot(useCaseData, aes(x=UCP))+geom_histogram(binwidth=10, colour="black", fill="white")+xlab("UCP")+ylab("Count")


print(grid.arrange(UCPHist1, UCPHist2, UCHist1, UCHist2, UCHist3, UCPHist3, UCPHist4, UCPHist5, ncol=4))

#Calcualte the apriroi means and variances
aprioriData <- aprioriData[c("Simple_UC","Average_UC", "Complex_UC")]
aprioriMeans <- cbind(mean(aprioriData[,"Simple_UC"]), mean(aprioriData[,"Average_UC"]), mean(aprioriData[,"Complex_UC"]))
colnames(aprioriMeans) <- c("Simple_UC", "Average_UC", "Complex_UC")
print('apriori means')
print(aprioriMeans)

aprioriVariance = cbind(var(aprioriData[,'Simple_UC']),var(aprioriData[,'Average_UC']),var(aprioriData[,'Complex_UC']))
colnames(aprioriVariance) = c('Simple_UC', 'Average_UC', 'Complex_UC')
print('apriori variance')
print(aprioriVariance)

# clibrate effort on the UCP to get the normalizing factor
ucpFit <- lm(Real_Effort_Person_Hours ~ UCP, data=useCaseData)
normFactor <- coef(ucpFit)[c('UCP')]

print("normalized effort")
normUUCW <- useCaseData[,'Real_Effort_Person_Hours']/(useCaseData[,'TCF']*useCaseData[,'EF']*normFactor)
print(normUUCW)
useCaseData$norm_uucw = normUUCW

#print out the distribution to see its normality...
png(filename=paste(outputPath,"norm_uucw_distribution.png", sep="/"),
		units="in",
		width=4*1, 
		height=4*1, 
		pointsize=12,
		res=96)
useCaseData$norm_uucw_log = normUUCW
#print("log transformation of the data")
#print(useCaseData$Real_Effort_Person_Hours)
uucw_log_plot <- ggplot(useCaseData, aes(x=norm_uucw_log))+geom_histogram(binwidth=100, colour="black", fill="white")+xlab("uucw")+ylab("Count")
print(uucw_log_plot)

#print(useCaseData)
print('covariance matrix for apriori data')
print(cor(aprioriData))
print('variance-covariance matrix for apriori data')
print(var(aprioriData))
w1 <- solve(var(aprioriData))
# calculate the precision matrix for the apriori information
c1 <- w1 %*% as.matrix(t(aprioriMeans))
print('weighted apriori calibrated parameters')
print(c1)

fit <- lm(norm_uucw ~ Simple_UC + Average_UC + Complex_UC - 1, data=useCaseData)
resVariance <- var(resid(fit))
print("residual variance")
print(resVariance)
useCaseDataX <- useCaseData[c("Simple_UC","Average_UC", "Complex_UC")]
w2 <- t(useCaseDataX) %*% as.matrix(useCaseDataX) / resVariance
#regressionVariance <- solve(w2)
regVariance <- resVariance * solve(t(useCaseDataX) %*% as.matrix(useCaseDataX))
print(w2)
print(regVariance)
coefs <- coef(fit)
#bias <- coefs[c("(Intercept)")]
print('regression calibrated parameters')
print(coefs)
coefs <- coefs[c("Simple_UC","Average_UC", "Complex_UC")]
c2 <- w2 %*% as.matrix(coefs)
print('weighted regression calibrated parameters')
print(c2)



averageCoefs = solve(w1+w2) %*% (c1 + c2)
bayesianVariance = solve(w1+w2)
print('bayesian averaged coefficients')
print(averageCoefs)
print('bayesian variance')
print(bayesianVariance)
#print(bias)

#bayesianModel <- as.formula("norm_uucw ~ 5*Simple_UC + 10*Average_UC + 15*Complex_UC")
#print(predict(eval(bayesianModel), useCaseDataX))

#print(by(useCaseDataX, 1:nrow(useCaseDataX), function(row) row * averageCoefs))

bayesianPredictedEffort <- as.matrix(useCaseDataX) %*% averageCoefs
actualEffort <- useCaseData[,"norm_uucw"]
residual <- abs(bayesianPredictedEffort - actualEffort)
output <- cbind(bayesianPredictedEffort, predict(fit), actualEffort, residual, abs(residuals(fit)))
colnames(output) <- c("bayesian", "estimated", "actual", "bayesian_residual", "residual")
print(output)
print(mean(residual))
print(mean(abs(residuals(fit))))

print(summary(fit))

#draw the density flots

#Simple use case bayesian averaging plot
dat1 <- data.frame(dens1 = c(rnorm(100, aprioriMeans[,'Simple_UC'], aprioriVariance[,'Simple_UC']), rnorm(100, coefs['Simple_UC'], regVariance['Simple_UC', 'Simple_UC']),rnorm(100, averageCoefs['Simple_UC',1], bayesianVariance['Simple_UC', 'Simple_UC']))
		, lines1 = rep(c("apriori", "regression", "bayesian"), each = 100))
print("data frame 1")
print(dat1)
svg(paste(outputPath,"simple_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
simplePlot <- ggplot(dat1, aes(x = dens1, fill = lines1)) + geom_density(alpha = 0.5)+labs(x="Simple Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-25:25)))
print(simplePlot)

#Average use case bayesian averaging plot
dat2 <- data.frame(dens2 = c(rnorm(100, aprioriMeans[,'Average_UC'], aprioriVariance[,'Average_UC']), rnorm(100, coefs['Average_UC'], regVariance['Average_UC', 'Average_UC']),rnorm(100, averageCoefs['Average_UC',1], bayesianVariance['Average_UC', 'Average_UC']))
		, lines2 = rep(c("apriori", "regression", "bayesian"), each = 100))
svg(paste(outputPath,"average_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
averagePlot <- ggplot(dat2, aes(x = dens2, fill = lines2)) + geom_density(alpha = 0.5)+labs(x="Average Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-25:25)))
print(averagePlot)

#Complex use case bayesian averaging plot
dat3 <- data.frame(dens3 = c(rnorm(100, aprioriMeans[,'Complex_UC'], aprioriVariance[,'Complex_UC']), rnorm(100, coefs['Complex_UC'], regVariance['Complex_UC', 'Complex_UC']),rnorm(100, averageCoefs['Complex_UC',1], bayesianVariance['Complex_UC', 'Complex_UC']))
		, lines3 = rep(c("apriori", "regression", "bayesian"), each = 100))
svg(paste(outputPath,"complex_use_case_bayesian_average_plot.svg", sep="/"), width=3, height=3)
complexPlot <- ggplot(dat3, aes(x = dens3, fill = lines3)) + geom_density(alpha = 0.5)+labs(x="Complex Use Case Weight", y="Density", fill="Methods")+ xlim(range(c(-25:25)))
print(complexPlot)

#print("output dat")
#combDat <- cbind(dat1, dat2, dat3)
svg(paste(outputPath,"combined_use_case_bayesian_average_plot.svg", sep="/"), width=12, height=3)
#print(ggplot(combDat)+geom_density(alpha = 0.5,aes(x = dens1, fill = lines1)+geom_density(alpha = 0.5,aes(x = dens2, fill = lines2))+geom_density(alpha = 0.5,aes(x = dens3, fill = lines3))))

g_legend<-function(a.gplot){
	tmp <- ggplot_gtable(ggplot_build(a.gplot))
	leg <- which(sapply(tmp$grobs, function(x) x$name) == "guide-box")
	legend <- tmp$grobs[[leg]]
	return(legend)}

mylegend<-g_legend(simplePlot+ theme(legend.position="bottom"))

print(grid.arrange(arrangeGrob(simplePlot+guides(fill=FALSE), averagePlot+guides(fill=FALSE), complexPlot+guides(fill=FALSE), ncol=3), mylegend,nrow=2, heights=c(10, 1)))

# 10 fold cross validation of mmre, pred(.25), pred(.50)
# estimate the predication accuracy by n fold cross validation.
#Randomly shuffle the data
useCaseData<-useCaseData[sample(nrow(useCaseData)),]
#Create 10 equally size folds
nfold = 5
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
	
	print('bayesian testing set predication')
	
	foldFit <- lm(norm_uucw ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	foldResVariance <- var(resid(foldFit))
	foldW2 <- t(trainDataX) %*% as.matrix(trainDataX) / foldResVariance
	print(foldW2)
	foldCoefs <- coef(foldFit)
	foldCoefs <- foldCoefs[c("Simple_UC","Average_UC", "Complex_UC")]
	foldC2 <- foldW2 %*% as.matrix(foldCoefs)
	print(foldC2)
	foldAverageCoefs = solve(w1+foldW2) %*% (c1 + foldC2)
	
	#bayesian.mre = apply(testData, 1, function(x))
	bayesian.predict = cbind(as.matrix(testDataX) %*% foldAverageCoefs, testData$norm_uucw)
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
	apriori.predict = cbind(as.matrix(testDataX) %*% t(aprioriMeans), testData$norm_uucw)
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
	regression.m = lm(norm_uucw ~ Simple_UC + Average_UC + Complex_UC - 1, data=trainData)
	regression.predict = cbind(predicted=predict(regression.m, testData), actual=testData$norm_uucw)
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
colnames(avgPreds) <- c("Pred","Bayesian","Apriori","Regression")
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
svg(paste(outputPath,"use_case_weight_calibration_err_plot.svg", sep="/"), width=12, height=4)
print(ggplot(meltAvgPreds) + geom_point(aes(x=Pred, y=Value, group=Method,color=Method),size=3))

print("melt avg preds info as lines and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_lines_smooth.svg", sep="/"), width=12, height=4)
ggplot(meltAvgPreds) + 
		geom_line(aes(y=Value, x=Pred, group=Method,color=Method)) +
		stat_smooth(aes(y=Value, x=Pred, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)

print("melt avg preds info as dots and smooth function")
svg(paste(outputPath,"use_case_weight_calibration_err_plot_dots_smooth.svg", sep="/"), width=12, height=4)
ggplot(meltAvgPreds) + 
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method,shape=Method),size=1.5) +
		scale_shape_manual(values=c(0,1,2))+
		stat_smooth(aes(x=Pred, y=Value, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")


#also have linear regression on sloc and normalized effort.
sink()

