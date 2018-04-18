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
reportPath <- paste(outputPath,'comparison-between-size-metrics.txt', sep='/')
linearRegressionPlotPath <- paste(outputPath,'use-case-point-linear-regression-plot.png', sep='/')
independentVariablesScatterPlotPath <- paste(outputPath,'use-case-point-independent-variable-scatter-plot.png', sep='/')

# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries

library(lattice)
#library(latticeExtra)
# set the output file
#library(reshape)
#library(dplyr)

library(ggplot2)
library(data.table)
library(gridExtra)
#library(gridExtra)
library(car)


sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)

png(filename=paste(outputPath,"project_characteristics.png", sep="/"),
		units="in",
		width=3*2, 
		height=2*2, 
		pointsize=12,
		res=96)

UCPHist1 <- ggplot(data, aes(x=Effort_Norm))+geom_histogram(binwidth=350, colour="white", fill="gray55")+xlab("Normalized Effort (PH)")+ylab("Number of Projects")+theme_bw()
UCPHist2 <- ggplot(data, aes(x=KSLOC))+geom_histogram(binwidth=0.5, colour="white", fill="gray55")+xlab("KSLOC")+ylab("Number of Projects")+theme_bw()
UCPHist3 <- ggplot(data, aes(x=Use_Case_Num))+geom_histogram(binwidth=1.5, colour="white", fill="gray55")+xlab("Use Case Number")+ylab("Number of Projects")+theme_bw()
projectBar <- ggplot(data, aes(x=Type))+geom_bar(colour="white", fill="gray55")+xlab("Application Type")+ylab("Number of Projects")+ scale_x_discrete(label=abbreviate)+theme_bw()

print(grid.arrange(UCPHist1, UCPHist2, UCPHist3, projectBar, ncol=2))

#analysis of the counting results.
png(filename=paste(outputPath,"project_counting_results.png", sep="/"),
		units="in",
		width=3*2, 
		height=2*2, 
		pointsize=12,
		res=96)

UCPHist1 <- ggplot(data, aes(x=SWTI))+geom_histogram(binwidth=70, colour="white", fill="gray55")+xlab("SWTI")+ylab("Number of Projects")+theme_bw()
UCPHist2 <- ggplot(data, aes(x=SWTII))+geom_histogram(binwidth=100, colour="white", fill="gray55")+xlab("SWTII")+ylab("Number of Projects")+theme_bw()
UCPHist3 <- ggplot(data, aes(x=SWTIII))+geom_histogram(binwidth=100, colour="white", fill="gray55")+xlab("SWTIII")+ylab("Number of Projects")+theme_bw()
UCPHist4 <- ggplot(data, aes(x=UUCP))+geom_histogram(binwidth=20, colour="white", fill="gray55")+xlab("UUCP")+ylab("Number of Projects")+theme_bw()

print(grid.arrange(UCPHist1, UCPHist2, UCPHist3, UCPHist4, ncol=2))

#analysis of the project characteristics.
useCaseVariables <- data[c("Effort_Norm", "TCF", "EF", "UUCW", "UAW", "UUCP", "SWTI", "SWTII", "SWTIII")]
useCaseVariablesMelt <- melt(useCaseVariables, id=c("Effort_Norm"))

independentVariablesScatterPlot = xyplot(Effort_Norm~ value | variable, data=useCaseVariablesMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Indepedent Variables", fontsize=10),
		ylab=list(label="Normalized Effort (PH)", fontsize=10),
		strip =strip.custom(factor.levels = c("TCF","EF", "UUCW", "UAW", "UUCP", "SWTI", "SWTII", "SWTIII")),
		#upper=data$upper,
		#lower=data$lower,
		scales=list(x=list(relation="free")),
		auto.key = TRUE,
		type = c("p"))

png(filename=independentVariablesScatterPlotPath,
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*3,
		res=96)

print(independentVariablesScatterPlot)

#print correlation matrix for the variables and independent variables
print("correlation matrix:")
print(round(cor(useCaseVariables), 2))

useCaseData <- data[c("Effort_Norm", "SWTI", "SWTII", "SWTIII")]
#running OLS linear regression and output the diagrams for the linear regressions
#useCaseDataMelt <- gather(useCaseData, key=variable, value=value, SWTI, SWTII SWTIII)
useCaseDataMelt <- melt(useCaseData, id=c("Effort_Norm"))

print(useCaseDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and SWTI
print("correlation between effort and SWTI")
cor1 = cor.test(data$Effort_Norm, data$SWTI)
print(cor1)
print(round(cor1$p.value,3))
print("linear regression of effort on SWTI")
m1 = lm(Effort_Norm~SWTI, data=data)
print("confidence interval for the parameters")
print(confint(m1))
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
print("R-squared")
summary(m1)$r.squared
newx1 <- seq(-100, max(data$SWTI)+100, length.out=100)
pred1 = predict(m1,data.frame(SWTI=newx1), interval='confidence')
print(round(coeff1,3))

png(filename=paste(outputPath,'swti_outlier_test.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
outlierTest(m1) # Bonferonni p-value for most extreme obs
qqPlot(m1, main="QQ Plot") #qq plot for studentized resid 
leveragePlots(m1) # leverage plots

png(filename=paste(outputPath,'swti_influential_test.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
# Influential Observations
# added variable plots 
avPlots(m1)
# Cook's D plot
# identify D values > 4/(n-k-1) 
cutoff <- 4/((nrow(data)-length(m1$coefficients)-2)) 
plot(m1, which=4, cook.levels=cutoff)
# Influence Plot 
influencePlot(m1, id.method="identify", main="Influence Plot", sub="Circle size is proportial to Cook's Distance" )

# Normality of Residuals
# qq plot for studentized resid
png(filename=paste(outputPath,'swti_non_normality.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
qqPlot(m1, main="QQ Plot") #qq plot for studentized resid 
# distribution of studentized residuals
library(MASS)

sresid <- studres(m1) 
hist(sresid, freq=FALSE,
		main="Distribution of Studentized Residuals")
xfit<-seq(min(sresid),max(sresid),length=40) 
yfit<-dnorm(xfit) 
lines(xfit, yfit)


png(filename=paste(outputPath,'swti_spread_level_plot.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)

# Evaluate homoscedasticity
# non-constant error variance test
ncvTest(m1)
# plot studentized residuals vs. fitted values 

spreadLevelPlot(m1)

#png(filename=paste(outputPath,'nt_cr_plot.png', sep='/'),
#		type="cairo",
#		units="in", 
#		width=4*2, 
#		height=4*2,
#		res=96)
# Evaluate Nonlinearity
# component + residual plot 
#crPlots(m1)
# Ceres plots 
#ceresPlots(m1)


#correlation between effort and SWTII
print("correlation between effort and SWTII")
cor2 = cor.test(data$Effort_Norm, data$SWTII)
print(cor2)
print(round(cor2$p.value,3))
print("linear regression of effort on SWTII")
#print(axis1)
m2 = lm(Effort_Norm~SWTII, data=data)
print("confidence interval for the parameters")
print(confint(m2))
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff2 = summary(m2)$coefficients
print("R-squared")
summary(m2)$r.squared
newx2 <- seq(-100, max(data$SWTII)+100, length.out=100)
pred2 = predict(m2,data.frame(SWTII=newx2), interval='confidence')
print(round(coeff2,3))

png(filename=paste(outputPath,'swtii_outlier_test.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
outlierTest(m2) # Bonferonni p-value for most extreme obs
qqPlot(m2, main="QQ Plot") #qq plot for studentized resid 
leveragePlots(m2) # leverage plots

png(filename=paste(outputPath,'swtii_influential_test.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
# Influential Observations
# added variable plots 
avPlots(m2)
# Cook's D plot
# identify D values > 4/(n-k-1) 
cutoff <- 4/((nrow(data)-length(m2$coefficients)-2)) 
plot(m2, which=4, cook.levels=cutoff)
# Influence Plot 
influencePlot(m2, id.method="identify", main="Influence Plot", sub="Circle size is proportial to Cook's Distance" )

# Normality of Residuals
# qq plot for studentized resid
png(filename=paste(outputPath,'swtii_non_normality.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
qqPlot(m2, main="QQ Plot") #qq plot for studentized resid 
# distribution of studentized residuals
library(MASS)

sresid <- studres(m2) 
hist(sresid, freq=FALSE,
		main="Distribution of Studentized Residuals")
xfit<-seq(min(sresid),max(sresid),length=40) 
yfit<-dnorm(xfit) 
lines(xfit, yfit)


png(filename=paste(outputPath,'swtii_spread_level_plot.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)

# Evaluate homoscedasticity
# non-constant error variance test
ncvTest(m2)
# plot studentized residuals vs. fitted values 

spreadLevelPlot(m2)

#png(filename=paste(outputPath,'nt_cr_plot.png', sep='/'),
#		type="cairo",
#		units="in", 
#		width=4*2, 
#		height=4*2,
#		res=96)
# Evaluate Nonlinearity
# component + residual plot 
#crPlots(m1)
# Ceres plots 
#ceresPlots(m2)

#correlation between effort and SWTIII
print("correlation between effort and SWTIII")
cor3 = cor.test(data$Effort_Norm, data$SWTIII)
print(cor3)
print(round(cor3$p.value,3))
print("linear regression of effort on SWTIII")
#print(axis1)
m3 = lm(Effort_Norm~SWTIII, data=data)
print("confidence interval for the parameters")
print(confint(m3))
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff3 = summary(m3)$coefficients
print("R-squared")
summary(m3)$r.squared
newx3 <- seq(-100, max(data$SWTIII)+100, length.out=100)
#print(newx3)
pred3 = predict(m3, data.frame(SWTIII=newx3), interval='confidence')
#print(pred3)
print(round(coeff3,3))


png(filename=paste(outputPath,'swtiii_outlier_test.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
outlierTest(m3) # Bonferonni p-value for most extreme obs
qqPlot(m3, main="QQ Plot") #qq plot for studentized resid 
leveragePlots(m3) # leverage plots

png(filename=paste(outputPath,'swtiii_influential_test.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
# Influential Observations
# added variable plots 
avPlots(m3)
# Cook's D plot
# identify D values > 4/(n-k-1) 
cutoff <- 4/((nrow(data)-length(m3$coefficients)-2)) 
plot(m3, which=4, cook.levels=cutoff)
# Influence Plot 
influencePlot(m3, id.method="identify", main="Influence Plot", sub="Circle size is proportial to Cook's Distance" )

# Normality of Residuals
# qq plot for studentized resid
png(filename=paste(outputPath,'swtiii_non_normality.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)
qqPlot(m3, main="QQ Plot") #qq plot for studentized resid 
# distribution of studentized residuals
library(MASS)

sresid <- studres(m3) 
hist(sresid, freq=FALSE,
		main="Distribution of Studentized Residuals")
xfit<-seq(min(sresid),max(sresid),length=40) 
yfit<-dnorm(xfit) 
lines(xfit, yfit)


png(filename=paste(outputPath,'swtiii_spread_level_plot.png', sep='/'),
		type="cairo",
		units="in", 
		width=4*2, 
		height=4*2,
		res=96)

# Evaluate homoscedasticity
# non-constant error variance test
ncvTest(m3)
# plot studentized residuals vs. fitted values 

spreadLevelPlot(m3)

#png(filename=paste(outputPath,'nt_cr_plot.png', sep='/'),
#		type="cairo",
#		units="in", 
#		width=4*2, 
#		height=4*2,
#		res=96)
# Evaluate Nonlinearity
# component + residual plot 
#crPlots(m1)
# Ceres plots 
#ceresPlots(m3)

corArray = c(cor1, cor2, cor3)
mArray = c(m1, m2, m3)
coeffs = list(coeff1, coeff2, coeff3)
preds = list(pred1, pred2, pred3)
newxArray = list(newx1, newx2,newx3)
xPosArray = c(777+100, 770+100, 850+100)

plot = xyplot(Effort_Norm~ value | variable, data=useCaseDataMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Software Size Metrics", fontsize=10),
		ylab=list(label="Normalized Effort (PH)", fontsize=10),
		strip =strip.custom(factor.levels = c("SWTI","SWTII","SWTIII")),
		#upper=data$upper,
		#lower=data$lower,
		scales=list(x=list(relation="free")),
		panel = function(x, y) {
			
			pred.c = preds[[panel.number()]]
			newx = newxArray[[panel.number()]]
			
			upper = pred.c[,3]
			lower = pred.c[,2]
			panel.polygon(c(rev(newx), newx), c(rev(upper), lower),  col = 'grey80', border = NA)
			
			panel.lines(newx, upper, lty = 'dashed', col = 'red')
			panel.lines(newx, lower, lty = 'dashed', col = 'red')
			
			panel.xyplot(x, y, grid = TRUE,
					type = c("p", "r"),
					col.line = "black")
		
			#eq = bquote(paste("y=", beta[0],"+",beta[1],"x"))
			#xPos = xPosArray[panel.number()]
			#panel.text(xPos, 2620+650-2600, eq, cex=0.8)
			#coefficients = coeffs[[panel.number()]]
			#p0 <- sprintf("%s: %.2f SE:%.2f", "\beta_0)", coefficients[1, 1], coefficients[1, 2])
			#p0.v = sprintf("%.2f",coefficients[1, 1])
			#p0.se = sprintf("%.2f",coefficients[1, 2])
			#p0 <- bquote(paste(beta[0],": ", .(p0.v)," SE: ",.(p0.se)))
			#panel.text(xPos, 2450+650-2600, p0, cex=0.8)
			#p1 <- expression(paste(beta[1],sprintf(": %.2f SE:%.2f", coefficients[2, 1], coefficients[2, 2])))
			#p1.v = sprintf("%.2f",coefficients[2, 1])
			#p1.se = sprintf("%.2f",coefficients[2, 2])
			#p1 <- bquote(paste(beta[1],": ", .(p1.v)," SE: ",.(p1.se)))
			#panel.text(xPos, 2290+650-2600, p1, cex=0.8)
			#r2 = bquote(paste(r, ": ", .(sprintf("%.2f",corArray[panel.number()]))))
			#panel.text(xPos, 2150+650-2600, r2, cex=0.7)
		},
		auto.key = TRUE,
		type = c("p", "r"))
		
		
# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
		png(filename=linearRegressionPlotPath,
				type="cairo",
				units="in", 
				width=4*3, 
				height=4*1,
				res=96)
		print(plot)
		
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

#add cocomo and original use case points into the comparison

otherSizeMetricsData=data[c("Effort", "UUCP", "Effort_Norm")];
#DataFrame=data.frame(Effort,UUCP)
#Effort
#UUCP
OriginalUseCaseModel=lm(Effort_Norm~UUCP,data=otherSizeMetricsData)

summary(OriginalUseCaseModel)

w=coef(OriginalUseCaseModel)["UUCP"]

otherSizeMetricsData$UUCPEffort=w*otherSizeMetricsData$UUCP

otherSizeMetricsData<-otherSizeMetricsData[sample(nrow(otherSizeMetricsData)),]

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(,nrow=nfold,ncol=16)
colnames(foldResults) <- c(
		'swti_mmre','swti_pred15','swti_pred25','swti_pred50', 
		'swtii_mmre','swtii_pred15','swtii_pred25','swtii_pred50',
		'swtiii_mmre','swtiii_pred15','swtiii_pred25','swtiii_pred50',
		'uucp_mmre','uucp_pred15','uucp_pred25','uucp_pred50'
		)

foldResults1 <- array(0,dim=c(100,4,nfold))

#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	
	otherTestData <- otherSizeMetricsData[testIndexes, ]
	otherTrainData <- otherSizeMetricsData[-testIndexes,]
	
	print('swti testing set predication')
	swti.m = lm(Effort_Norm~SWTI, data=trainData)
	#swti.mre = apply(testData, 1, function(x))
	swti.predict = cbind(predicted=predict(swti.m, testData), actual=testData$Effort_Norm)
	print(swti.predict)
	swti.mre = apply(swti.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	swti.mmre = mean(swti.mre)
	print(swti.mmre)
	#swti.preds = sapply(swti.mre, function(x) calculatePreds(x))
	swti.pred15 = length(swti.mre[swti.mre<=0.15])/length(swti.mre)
	swti.pred25 = length(swti.mre[swti.mre<=0.25])/length(swti.mre)
	swti.pred50 = length(swti.mre[swti.mre<=0.50])/length(swti.mre)
	print(c(swti.pred15, swti.pred25, swti.pred50))
	
	swti.pred <- 0
	for(j in 1:99){
		swti.pred <- c(swti.pred, length(swti.mre[swti.mre<=0.01*j])/length(swti.mre))
	}
	
	print('swtii testing set predication')
	swtii.m = lm(Effort_Norm~SWTII, data=trainData)
	swtii.predict = cbind(predicted=predict(swtii.m, testData), actual=testData$Effort_Norm)
	print(swtii.predict)
	swtii.mre = apply(swtii.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	swtii.mmre = mean(swtii.mre)
	print(swtii.mmre)
	#swtii.preds = sapply(swtii.mre, function(x) calculatePreds(x))
	swtii.pred15 = length(swtii.mre[swtii.mre<=0.15])/length(swtii.mre)
	swtii.pred25 = length(swtii.mre[swtii.mre<=0.25])/length(swtii.mre)
	swtii.pred50 = length(swtii.mre[swtii.mre<=0.50])/length(swtii.mre)
	print(c(swtii.pred15, swtii.pred25, swtii.pred50))
	
	swtii.pred <- 0
	for(j in 1:99){
		swtii.pred <- c(swtii.pred, length(swtii.mre[swtii.mre<=0.01*j])/length(swtii.mre))
	}
	
	print('swtiii testing set predication')
	swtiii.m = lm(Effort_Norm~SWTIII, data=trainData)
	swtiii.predict = cbind(predicted=predict(swtiii.m, testData), actual=testData$Effort_Norm)
	print(swtiii.predict)
	swtiii.mre = apply(swtiii.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	swtiii.mmre = mean(swtiii.mre)
	print(swtiii.mmre)
	#swtiii.preds = sapply(swtiii.mre, function(x) calculatePreds(x))
	swtiii.pred15 = length(swtiii.mre[swtiii.mre<=0.15])/length(swtiii.mre)
	swtiii.pred25 = length(swtiii.mre[swtiii.mre<=0.25])/length(swtiii.mre)
	swtiii.pred50 = length(swtiii.mre[swtiii.mre<=0.50])/length(swtiii.mre)
	print(c(swtiii.pred15, swtiii.pred25, swtiii.pred50))
	
	swtiii.pred <- 0
	for(j in 1:99){
		swtiii.pred <- c(swtiii.pred, length(swtiii.mre[swtiii.mre<=0.01*j])/length(swtiii.mre))
	}
	
	print('uucp testing set predication')
	uucp.m = lm(Effort_Norm~UUCP, data=otherTrainData)
	uucp.predict = cbind(predicted=predict(uucp.m, otherTestData), actual=otherTestData$Effort_Norm)
	print(uucp.predict)
	uucp.mre = apply(uucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	uucp.mmre = mean(uucp.mre)
	print(uucp.mmre)
	#uucp.preds = sapply(uucp.mre, function(x) calculatePreds(x))
	uucp.pred15 = length(uucp.mre[uucp.mre<=0.15])/length(uucp.mre)
	uucp.pred25 = length(uucp.mre[uucp.mre<=0.25])/length(uucp.mre)
	uucp.pred50 = length(uucp.mre[uucp.mre<=0.50])/length(uucp.mre)
	print(c(uucp.pred15, uucp.pred25, uucp.pred50))
	
	uucp.pred <- 0
	for(j in 1:99){
		uucp.pred <- c(uucp.pred, length(uucp.mre[uucp.mre<=0.01*j])/length(uucp.mre))
	}
	
	foldResults[i,] = c(
			swti.mmre,swti.pred15,swti.pred25,swti.pred50,
			swti.mmre,swtii.pred15,swtii.pred25,swtii.pred50,
			swtiii.mmre,swtiii.pred15,swtiii.pred25,swtiii.pred50,
			uucp.mmre,uucp.pred15,uucp.pred25,uucp.pred50
			)
	
	foldResults1[,,i] = array(c(swti.pred,swtii.pred,swtiii.pred,uucp.pred),c(100,4))
}

#average out the folds.
print('10 cross validation results')
print(foldResults);
cvResults <- c(
		mean(foldResults[, 'swti_mmre']),
		mean(foldResults[, 'swti_pred15']),
		mean(foldResults[, 'swti_pred25']),
		mean(foldResults[, 'swti_pred50']),
		mean(foldResults[, 'swtii_mmre']),
		mean(foldResults[, 'swtii_pred15']),
		mean(foldResults[, 'swtii_pred25']),
		mean(foldResults[, 'swtii_pred50']),
		mean(foldResults[, 'swtiii_mmre']),
		mean(foldResults[, 'swtiii_pred15']),
		mean(foldResults[, 'swtiii_pred25']),
		mean(foldResults[, 'swtiii_pred50']),
		mean(foldResults[, 'uucp_mmre']),
		mean(foldResults[, 'uucp_pred15']),
		mean(foldResults[, 'uucp_pred25']),
		mean(foldResults[, 'uucp_pred50'])
		);
		

names(cvResults) <- c(
		'swti_mmre','swti_pred15','swti_pred25','swti_pred50',
		'swtii_mmre','swtii_pred15','swtii_pred25','swtii_pred50',
		'swtiii_mmre','swtiii_pred15','swtiii_pred25','swtiii_pred50',
		'uucp_mmre','uucp_pred15','uucp_pred25','uucp_pred50'
		)
print(cvResults)

avgPreds <- matrix(,nrow=100,ncol=5)
colnames(avgPreds) <- c("Pred","SWTI","SWTII","SWTIII", "UUCP")
for(i in 1:100){
	swti_fold_mean = mean(foldResults1[i,1,]);
	swtii_fold_mean = mean(foldResults1[i,2,]);
	swtiii_fold_mean = mean(foldResults1[i,3,]);
	uucp_fold_mean = mean(foldResults1[i,4,]);
	#cocomo_fold_mean = mean(foldResults1[i,5,]);
	#cocomo_apriori_fold_mean = mean(foldResults1[i,6,]);
	avgPreds[i,] <- c(i,swti_fold_mean,swtii_fold_mean,swtiii_fold_mean,uucp_fold_mean)
	#print(i)
	#print(avgPreds[i,])
}

print('average improvement by swti')
print(colMeans(avgPreds[, "SWTI"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by swtii')
print(colMeans(avgPreds[, "SWTII"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by swtiii')
print(colMeans(avgPreds[, "SWTIII"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by uucp')
print(colMeans(avgPreds[, "UUCP"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))

#print(mean(avgPreds[, "SWTII"] - avgPreds[,"UUCP"]))
#print(mean(avgPreds[, "SWTII"] - avgPreds[,"COCOMO"]))
#print(mean(avgPreds[, "SWTII"] - avgPreds[,"COCOMO Apriori"]))
#print(mean(avgPreds[, "SWTIII"] - avgPreds[,"SWTI"]))
#print(mean(avgPreds[, "SWTIII"] - avgPreds[,"SWTII"]))

avgPreds <- data.frame(avgPreds)
print(avgPreds)
meltAvgPreds = melt(avgPreds, id.vars="Pred", value.name="Value", variable.name="Method")

print("melt avg preds info")
print(meltAvgPreds)
svg(paste(outputPath,"size_metrics_err_plot.svg", sep="/"), width=6, height=4)
print(ggplot(meltAvgPreds) + theme_bw() + geom_point(aes(x=Pred, y=Value, group=Method,color=Method),size=3)+ xlab("Relative Deviation (%)") +
				ylab("Percentage")+ theme(legend.position="bottom"))

print("melt avg preds info as lines and smooth function")
svg(paste(outputPath,"size_metrics_err_lines_plot.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + theme_bw() + 
		geom_line(aes(y=Value, x=Pred, group=Method,color=Method)) +
		stat_smooth(aes(y=Value, x=Pred, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")

print("melt avg preds info as dots and smooth function")
svg(paste(outputPath,"size_metrics_err_dots_plot.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + theme_bw() + 
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method,shape=Method),size=1.5) +
		scale_shape_manual(values=c(0,1,2,3,4))+
		stat_smooth(aes(x=Pred, y=Value, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")

#also have linear regression on sloc and normalized effort.
sink()

#setwd(workDir)
# warnings()
# close the output file
#sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)