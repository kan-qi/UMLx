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
#library(gridExtra)


sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)


#analysis for the variables and independent variables to detect correlations.
useCaseVariables <- data[c("Effort_Norm_UCP", "UAW", "TCF", "EF", "UEUCW_ALY", "UEXUCW_ALY", "UDUCW_ALY")]
useCaseVariablesMelt <- melt(useCaseVariables, id=c("Effort_Norm_UCP"))

independentVariablesScatterPlot = xyplot(Effort_Norm_UCP~ value | variable, data=useCaseVariablesMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Indepedent Variables", fontsize=10),
		ylab=list(label="Normalized Effort (PH)", fontsize=10),
		strip =strip.custom(factor.levels = c("UAW","TCF","EF", "UEUCW", "UEXUCW", "UDUCW")),
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

useCaseData <- data[c("Effort_Norm_UCP", "EUCP_ALY", "EXUCP_ALY", "DUCP_ALY")]
#running OLS linear regression and output the diagrams for the linear regressions
#useCaseDataMelt <- gather(useCaseData, key=variable, value=value, EUCP_ALY, EXUCP_ALY, DUCP_ALY)
useCaseDataMelt <- melt(useCaseData, id=c("Effort_Norm_UCP"))

print(useCaseDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and EUCP
print("correlation between effort and EUCP_ALY")
cor1 = cor.test(data$Effort_Norm_UCP, data$EUCP_ALY)
print(cor1)
print(round(cor1$p.value,3))
print("linear regression of effort on EUCP_ALY")
m1 = lm(Effort_Norm_UCP~EUCP_ALY, data=data)
print("confidence interval for the parameters")
print(confint(m1))
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
print("R-squared")
summary(m1)$r.squared
newx1 <- seq(-100, max(data$EUCP_ALY)+100, length.out=100)
pred1 = predict(m1,data.frame(EUCP_ALY=newx1), interval='confidence')
print(round(coeff1,3))

#correlation between effort and EXUCP
print("correlation between effort and EXUCP")
cor2 = cor.test(data$Effort_Norm_UCP, data$EXUCP_ALY)
print(cor2)
print(round(cor2$p.value,3))
print("linear regression of effort on EXUCP_ALY")
#print(axis1)
m2 = lm(Effort_Norm_UCP~EXUCP_ALY, data=data)
print("confidence interval for the parameters")
print(confint(m2))
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff2 = summary(m2)$coefficients
print("R-squared")
summary(m2)$r.squared
newx2 <- seq(-100, max(data$EXUCP_ALY)+100, length.out=100)
pred2 = predict(m2,data.frame(EXUCP_ALY=newx2), interval='confidence')
print(round(coeff2,3))

#correlation between effort and DUCP
print("correlation between effort and DUCP")
cor3 = cor.test(data$Effort_Norm_UCP, data$DUCP_ALY)
print(cor3)
print(round(cor3$p.value,3))
print("linear regression of effort on DUCP_ALY")
#print(axis1)
m3 = lm(Effort_Norm_UCP~DUCP_ALY, data=data)
print("confidence interval for the parameters")
print(confint(m3))
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff3 = summary(m3)$coefficients
print("R-squared")
summary(m3)$r.squared
newx3 <- seq(-100, max(data$DUCP_ALY)+100, length.out=100)
#print(newx3)
pred3 = predict(m3, data.frame(DUCP_ALY=newx3), interval='confidence')
#print(pred3)
print(round(coeff3,3))

corArray = c(cor1, cor2, cor3)
mArray = c(m1, m2, m3)
coeffs = list(coeff1, coeff2, coeff3)
preds = list(pred1, pred2, pred3)
newxArray = list(newx1, newx2,newx3)
xPosArray = c(777+100, 770+100, 850+100)

plot = xyplot(Effort_Norm_UCP~ value | variable, data=useCaseDataMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Software Size Metrics", fontsize=10),
		ylab=list(label="Normalized Effort (PH)", fontsize=10),
		strip =strip.custom(factor.levels = c("EUCP","EXUCP","DUCP")),
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

otherSizeMetricsData=data[c("Effort", "COCOMOEstimation", "Effort_Most_Likely", "UCP", "Effort_Norm_UCP")];
#DataFrame=data.frame(Effort,UCP)
#Effort
#UCP
OriginalUseCaseModel=lm(Effort~UCP,data=otherSizeMetricsData)

summary(OriginalUseCaseModel)

w=coef(OriginalUseCaseModel)["UCP"]

otherSizeMetricsData$UCPEffort=w*otherSizeMetricsData$UCP

otherSizeMetricsData<-otherSizeMetricsData[sample(nrow(otherSizeMetricsData)),]

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(,nrow=nfold,ncol=24)
colnames(foldResults) <- c(
		'eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50', 
		'exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50',
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50'
)

foldResults1 <- array(0,dim=c(100,6,nfold))

#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	
	otherTestData <- otherSizeMetricsData[testIndexes, ]
	otherTrainData <- otherSizeMetricsData[-testIndexes,]
	
	print('eucp testing set predication')
	eucp.m = lm(Effort_Norm_UCP~EUCP_ALY, data=trainData)
	#eucp.mre = apply(testData, 1, function(x))
	eucp.predict = cbind(predicted=predict(eucp.m, testData), actual=testData$Effort_Norm_UCP)
	print(eucp.predict)
	eucp.mre = apply(eucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	eucp.mmre = mean(eucp.mre)
	print(eucp.mmre)
	#eucp.preds = sapply(eucp.mre, function(x) calculatePreds(x))
	eucp.pred15 = length(eucp.mre[eucp.mre<=0.15])/length(eucp.mre)
	eucp.pred25 = length(eucp.mre[eucp.mre<=0.25])/length(eucp.mre)
	eucp.pred50 = length(eucp.mre[eucp.mre<=0.50])/length(eucp.mre)
	print(c(eucp.pred15, eucp.pred25, eucp.pred50))
	
	eucp.pred <- 0
	for(j in 1:99){
		eucp.pred <- c(eucp.pred, length(eucp.mre[eucp.mre<=0.01*j])/length(eucp.mre))
	}
	
	print('exucp testing set predication')
	exucp.m = lm(Effort_Norm_UCP~EXUCP_ALY, data=trainData)
	exucp.predict = cbind(predicted=predict(exucp.m, testData), actual=testData$Effort_Norm_UCP)
	print(exucp.predict)
	exucp.mre = apply(exucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	exucp.mmre = mean(exucp.mre)
	print(exucp.mmre)
	#exucp.preds = sapply(exucp.mre, function(x) calculatePreds(x))
	exucp.pred15 = length(exucp.mre[exucp.mre<=0.15])/length(exucp.mre)
	exucp.pred25 = length(exucp.mre[exucp.mre<=0.25])/length(exucp.mre)
	exucp.pred50 = length(exucp.mre[exucp.mre<=0.50])/length(exucp.mre)
	print(c(exucp.pred15, exucp.pred25, exucp.pred50))
	
	exucp.pred <- 0
	for(j in 1:99){
		exucp.pred <- c(exucp.pred, length(exucp.mre[exucp.mre<=0.01*j])/length(exucp.mre))
	}
	
	print('ducp testing set predication')
	ducp.m = lm(Effort_Norm_UCP~DUCP_ALY, data=trainData)
	ducp.predict = cbind(predicted=predict(ducp.m, testData), actual=testData$Effort_Norm_UCP)
	print(ducp.predict)
	ducp.mre = apply(ducp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	ducp.mmre = mean(ducp.mre)
	print(ducp.mmre)
	#ducp.preds = sapply(ducp.mre, function(x) calculatePreds(x))
	ducp.pred15 = length(ducp.mre[ducp.mre<=0.15])/length(ducp.mre)
	ducp.pred25 = length(ducp.mre[ducp.mre<=0.25])/length(ducp.mre)
	ducp.pred50 = length(ducp.mre[ducp.mre<=0.50])/length(ducp.mre)
	print(c(ducp.pred15, ducp.pred25, ducp.pred50))
	
	ducp.pred <- 0
	for(j in 1:99){
		ducp.pred <- c(ducp.pred, length(ducp.mre[ducp.mre<=0.01*j])/length(ducp.mre))
	}
	
	print('ucp testing set predication')
	ucp.m = lm(Effort_Norm_UCP~UCP, data=otherTrainData)
	ucp.predict = cbind(predicted=predict(ucp.m, otherTestData), actual=otherTestData$Effort_Norm_UCP)
	print(ucp.predict)
	ucp.mre = apply(ucp.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	ucp.mmre = mean(ucp.mre)
	print(ucp.mmre)
	#ucp.preds = sapply(ucp.mre, function(x) calculatePreds(x))
	ucp.pred15 = length(ucp.mre[ucp.mre<=0.15])/length(ucp.mre)
	ucp.pred25 = length(ucp.mre[ucp.mre<=0.25])/length(ucp.mre)
	ucp.pred50 = length(ucp.mre[ucp.mre<=0.50])/length(ucp.mre)
	print(c(ucp.pred15, ucp.pred25, ucp.pred50))
	
	ucp.pred <- 0
	for(j in 1:99){
		ucp.pred <- c(ucp.pred, length(ucp.mre[ucp.mre<=0.01*j])/length(ucp.mre))
	}
	
	print('cocomo testing set predication')
	cocomoEstimationTestData = otherTestData[!otherTestData$COCOMOEstimation == 0, ]
	cocomo.predict = cbind(predicted=cocomoEstimationTestData$COCOMOEstimation, actual=cocomoEstimationTestData$Effort)
	print(cocomo.predict)
	cocomo.mre = apply(cocomo.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	cocomo.mmre = mean(cocomo.mre)
	print(cocomo.mmre)
	#cocomo.preds = sapply(cocomo.mre, function(x) calculatePreds(x))
	cocomo.pred15 = length(cocomo.mre[cocomo.mre<=0.15])/length(cocomo.mre)
	cocomo.pred25 = length(cocomo.mre[cocomo.mre<=0.25])/length(cocomo.mre)
	cocomo.pred50 = length(cocomo.mre[cocomo.mre<=0.50])/length(cocomo.mre)
	print(c(cocomo.pred15, cocomo.pred25, cocomo.pred50))
	
	cocomo.pred <- 0
	for(j in 1:99){
		cocomo.pred <- c(cocomo.pred, length(cocomo.mre[cocomo.mre<=0.01*j])/length(cocomo.mre))
	}
	
	#print("other test data");
	#print(otherTestData);
	print('cocomo apriori testing set predication')
	cocomoAprioriEstimationTestData = otherTestData[!otherTestData$Effort_Most_Likely == 0,]
	print(cocomoAprioriEstimationTestData)
	cocomo_apriori.predict = cbind(predicted=cocomoAprioriEstimationTestData$Effort_Most_Likely, actual=cocomoAprioriEstimationTestData$Effort)
	print(cocomo_apriori.predict)
	cocomo_apriori.mre = apply(cocomo_apriori.predict, 1, function(x) abs(x[1] - x[2])/x[2])
	cocomo_apriori.mmre = mean(cocomo_apriori.mre)
	print(cocomo_apriori.mmre)
	#cocomo_apriori.preds = sapply(cocomo_apriori.mre, function(x) calculatePreds(x))
	cocomo_apriori.pred15 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.15])/length(cocomo_apriori.mre)
	cocomo_apriori.pred25 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.25])/length(cocomo_apriori.mre)
	cocomo_apriori.pred50 = length(cocomo_apriori.mre[cocomo_apriori.mre<=0.50])/length(cocomo_apriori.mre)
	print(c(cocomo_apriori.pred15, cocomo_apriori.pred25, cocomo_apriori.pred50))
	
	cocomo_apriori.pred <- 0
	for(j in 1:99){
		cocomo_apriori.pred <- c(cocomo_apriori.pred, length(cocomo_apriori.mre[cocomo_apriori.mre<=0.01*j])/length(cocomo_apriori.mre))
	}
	
	foldResults[i,] = c(
			eucp.mmre,eucp.pred15,eucp.pred25,eucp.pred50,
			exucp.mmre,exucp.pred15,exucp.pred25,exucp.pred50,
			ducp.mmre,ducp.pred15,ducp.pred25,ducp.pred50,
			ucp.mmre,ucp.pred15,ucp.pred25,ucp.pred50,
			cocomo.mmre,cocomo.pred15,cocomo.pred25,cocomo.pred50,
			cocomo_apriori.mmre,cocomo_apriori.pred15,cocomo_apriori.pred25,cocomo_apriori.pred50
			)
	
	foldResults1[,,i] = array(c(eucp.pred,exucp.pred,ducp.pred,ucp.pred,cocomo.pred,cocomo_apriori.pred),c(100,6))
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
		mean(foldResults[, 'ducp_pred50']),
		mean(foldResults[, 'ucp_mmre']),
		mean(foldResults[, 'ucp_pred15']),
		mean(foldResults[, 'ucp_pred25']),
		mean(foldResults[, 'ucp_pred50']),
		mean(foldResults[, 'cocomo_mmre']),
		mean(foldResults[, 'cocomo_pred15']),
		mean(foldResults[, 'cocomo_pred25']),
		mean(foldResults[, 'cocomo_pred50']),
		mean(foldResults[, 'cocomo_apriori_mmre']),
		mean(foldResults[, 'cocomo_apriori_pred15']),
		mean(foldResults[, 'cocomo_apriori_pred25']),
		mean(foldResults[, 'cocomo_apriori_pred50'])
		);

names(cvResults) <- c(
		'eucp_mmre','eucp_pred15','eucp_pred25','eucp_pred50',
		'exucp_mmre','exucp_pred15','exucp_pred25','exucp_pred50',
		'ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50',
		'ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50',
		'cocomo_mmre','cocomo_pred15','cocomo_pred25','cocomo_pred50',
		'cocomo_apriori_mmre','cocomo_apriori_pred15','cocomo_apriori_pred25','cocomo_apriori_pred50'
		)
print(cvResults)

avgPreds <- matrix(,nrow=100,ncol=7)
colnames(avgPreds) <- c("Pred","EUCP","EXUCP","DUCP", "UCP", "COCOMO", "COCOMO Apriori")
for(i in 1:100){
	eucp_fold_mean = mean(foldResults1[i,1,]);
	exucp_fold_mean = mean(foldResults1[i,2,]);
	ducp_fold_mean = mean(foldResults1[i,3,]);
	ucp_fold_mean = mean(foldResults1[i,4,]);
	cocomo_fold_mean = mean(foldResults1[i,5,]);
	cocomo_apriori_fold_mean = mean(foldResults1[i,6,]);
	avgPreds[i,] <- c(i,eucp_fold_mean,exucp_fold_mean,ducp_fold_mean,ucp_fold_mean,cocomo_fold_mean,cocomo_apriori_fold_mean)
	#print(i)
	#print(avgPreds[i,])
}

print('average improvement by eucp')
print(colMeans(avgPreds[, "EUCP"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by exucp')
print(colMeans(avgPreds[, "EXUCP"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by ducp')
print(colMeans(avgPreds[, "DUCP"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by ucp')
print(colMeans(avgPreds[, "UCP"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by cocomo')
print(colMeans(avgPreds[, "COCOMO"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))
print('average improvement by cocomo.apriori')
print(colMeans(avgPreds[, "COCOMO Apriori"] - avgPreds[,!colnames(avgPreds) %in% c("Pred")]))

#print(mean(avgPreds[, "EXUCP"] - avgPreds[,"UCP"]))
#print(mean(avgPreds[, "EXUCP"] - avgPreds[,"COCOMO"]))
#print(mean(avgPreds[, "EXUCP"] - avgPreds[,"COCOMO Apriori"]))
#print(mean(avgPreds[, "DUCP"] - avgPreds[,"EUCP"]))
#print(mean(avgPreds[, "DUCP"] - avgPreds[,"EXUCP"]))

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
		scale_shape_manual(values=c(0,1,2,3,4,5,6))+
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