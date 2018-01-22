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
reportPath <- paste(outputPath,'ucp-ducp-linear-regression-report.txt', sep='/')
pngPath <- paste(outputPath,'ucp-ducp-linear-regression-plot.png', sep='/')
pngPath1 <- paste(outputPath,'ucp-ducp-linear-regression-plot1.png', sep='/')

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

sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)


#output the project descriptive data for number valued data
png(filename=paste(outputPath,"project_descriptive_statistics_for_ducp_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=3*2, 
		pointsize=12,
		res=96)

projectHist1 <- ggplot(data, aes(x=Real_Effort))+geom_histogram(binwidth=200, colour="white", fill="gray55")+xlab("Effort (person-hours)")+ylab("Number of Projects")
projectHist2 <- ggplot(data, aes(x=KSLOC))+geom_histogram(binwidth=1, colour="white", fill="gray55")+xlab("KSLOC")+ylab("Number of Projects")
projectHist3 <- ggplot(data, aes(x=Use_Case_Num))+geom_histogram(binwidth=2, colour="white", fill="gray55")+xlab("Use Case Num")+ylab("Number of Projects")
projectBar <- ggplot(data, aes(x=Application_Type))+geom_bar(colour="white", fill="gray55")+xlab("Application Type")+ylab("Number of Projects")+ scale_x_discrete(label=abbreviate)
print(grid.arrange(projectHist1, projectHist2, projectHist3, projectBar, ncol=2))



#output the use case related statistics

png(filename=paste(outputPath,"project_counting_statistics_for_ducp_analysis.png", sep="/"),
		units="in",
		width=4*2, 
		height=3*4, 
		pointsize=12,
		res=96)

UCPHist1 <- ggplot(data, aes(x=UAW))+geom_histogram(binwidth=1.5, colour="white", fill="gray55")+xlab("UAW")+ylab("Number of Projects")
UCPHist2 <- ggplot(data, aes(x=UDUCW))+geom_histogram(binwidth=30, colour="white", fill="gray55")+xlab("UDUCW")+ylab("Number of Projects")
UCPHist3 <- ggplot(data, aes(x=DUCP))+geom_histogram(binwidth=45, colour="white", fill="gray55")+xlab("DUCP")+ylab("Number of Projects")
UCPHist4 <- ggplot(data, aes(x=UUCW))+geom_histogram(binwidth=20, colour="white", fill="gray55")+xlab("UUCW")+ylab("Number of Projects")
UCPHist5 <- ggplot(data, aes(x=UCP))+geom_histogram(binwidth=30, colour="white", fill="gray55")+xlab("UCP")+ylab("Number of Projects")
UCPHist6 <- ggplot(data, aes(x=TCF))+geom_histogram(binwidth=0.02, colour="white", fill="gray55")+xlab("TCF")+ylab("Number of Projects")
UCPHist7 <- ggplot(data, aes(x=EF))+geom_histogram(binwidth=0.02, colour="white", fill="gray55")+xlab("EF")+ylab("Number of Projects")

print(grid.arrange(UCPHist1, UCPHist2, UCPHist3, UCPHist4, UCPHist5, UCPHist6, UCPHist7, ncol=2))

useCaseData <- data[c("Real_Effort", "DUCP", "UCP")]
#useCaseDataMelt <- gather(useCaseData, key=variable, value=value, DUCP, UCP, WTNDC_ALY)
useCaseDataMelt <- melt(useCaseData, id=c("Real_Effort"))

print(useCaseDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and DUCP")
#cor1 = cor(data$Real_Effort, data$DUCP)
print("linear regression of effort on DUCP")
m1 = lm(Real_Effort~DUCP, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
summary(m1)$r.squared
newx1 <- seq(-100, max(data$DUCP)+100, length.out=100)
pred1 = predict(m1,data.frame(DUCP=newx1), interval='confidence')
print(coeff1)

#correlation between effort and TN
print("correlation between effort and UCP")
#cor2 = cor(data$Real_Effort, data$UCP)
print("linear regression of effort on UCP")
#print(axis1)
m2 = lm(Real_Effort~UCP, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff2 = summary(m2)$coefficients
summary(m2)$r.squared
newx2 <- seq(-100, max(data$UCP)+100, length.out=100)
pred2 = predict(m2,data.frame(UCP=newx2), interval='confidence')
print(coeff2)

plot = xyplot(Real_Effort ~ value | variable, data=useCaseDataMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Software Sizes", fontsize=10),
		ylab=list(label="Effort (man-hours)", fontsize=10),
		strip =strip.custom(factor.levels = c("DUCP","UCP")),
		scales=list(x=list(relation="free")),
		auto.key = TRUE,
		type = c("p", "r"))

plot1 = ggplot(data = useCaseData, aes(x = DUCP, y = Real_Effort)) + 
		geom_point(color='blue') +
		geom_smooth(color='black', method = "lm", se = TRUE)+
		xlab("DUCP")+
		ylab("Effort (person-hours)")

plot2 = ggplot(data = useCaseData, aes(x = UCP, y = Real_Effort)) + 
		geom_point(color='blue') +
		geom_smooth(color='black', method = "lm", se = TRUE)+
		xlab("UCP")+
		ylab("Effort (person-hours)")

# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename=pngPath,
		type="cairo",
		units="in", 
		width=4*2, 
		height=3*1,
		res=96)
print(grid.arrange(plot1,plot2, ncol=2))

# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename=pngPath1,
		type="cairo",
		units="in", 
		width=4*2, 
		height=3*1,
		res=96)
print(plot)


# 10 fold cross validation of mmre, pred(.25), pred(.50)
# estimate the predication accuracy by n fold cross validation.
#Randomly shuffle the data
useCaseData<-useCaseData[sample(nrow(useCaseData)),]
#Create 10 equally size folds
nfold = 5
folds <- cut(seq(1,nrow(useCaseData)),breaks=nfold,labels=FALSE)

#data structure to hold the data for 10 fold cross validation
foldResults <- matrix(,nrow=nfold,ncol=8)
colnames(foldResults) <- c('ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50','ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50')

foldResults1 <- array(0,dim=c(100,2,nfold))
#Perform 10 fold cross validation
for(i in 1:nfold){
	#Segement your data by fold using the which() function 
	testIndexes <- which(folds==i,arr.ind=TRUE)
	testData <- useCaseData[testIndexes, ]
	trainData <- useCaseData[-testIndexes, ]
	
	print('ducp testing set predication')
	ducp.m = lm(Real_Effort~DUCP, data=trainData)
	#ducp.mre = apply(testData, 1, function(x))
	ducp.predict = cbind(predicted=predict(ducp.m, testData), actual=testData$Real_Effort)
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
	ucp.m = lm(Real_Effort~UCP, data=trainData)
	ucp.predict = cbind(predicted=predict(ucp.m, testData), actual=testData$Real_Effort)
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
	
	foldResults[i,] = c(ducp.mmre,ducp.pred15,ducp.pred25,ducp.pred50,ucp.mmre,ucp.pred15,ucp.pred25,ucp.pred50)
	foldResults1[,,i] = array(c(ducp.pred, ucp.pred),c(100,2))
}

#average out the folds.
print('n cross validation results')
print(foldResults);
cvResults <- c(
		mean(foldResults[, 'ducp_mmre']),
		mean(foldResults[, 'ducp_pred15']),
		mean(foldResults[, 'ducp_pred25']),
		mean(foldResults[, 'ducp_pred50']),
		mean(foldResults[, 'ucp_mmre']),
		mean(foldResults[, 'ucp_pred15']),
		mean(foldResults[, 'ucp_pred25']),
		mean(foldResults[, 'ucp_pred50'])
);

names(cvResults) <- c('ducp_mmre','ducp_pred15','ducp_pred25','ducp_pred50','ucp_mmre','ucp_pred15','ucp_pred25','ucp_pred50')
print(cvResults)

avgPreds <- matrix(,nrow=100,ncol=3)
colnames(avgPreds) <- c("Pred","DUCP","UCP")
for(i in 1:100){
	ducp_fold_mean = mean(foldResults1[i,1,]);
	ucp_fold_mean = mean(foldResults1[i,2,]);
	avgPreds[i,] <- c(i,ducp_fold_mean,ucp_fold_mean)
	#print(i)
	#print(avgPreds[i,])
}

print('average improvement over ucp')
print(mean(avgPreds[, "DUCP"] - avgPreds[,"UCP"]))

avgPreds <- data.frame(avgPreds)
print(avgPreds)
meltAvgPreds = melt(avgPreds, id.vars="Pred", value.name="Value", variable.name="Method")

print("melt avg preds info")
print(meltAvgPreds)
svg(paste(outputPath,"ducp_ucp_err_plot.svg", sep="/"), width=6, height=4)
print(ggplot(meltAvgPreds) + geom_point(aes(x=Pred, y=Value, group=Method,color=Method),size=3)+ xlab("Relative Deviation (%)") +
				ylab("Percentage")+ theme(legend.position="bottom"))

print("melt avg preds info as lines and smooth function")
svg(paste(outputPath,"ducp_ucp_err_plot_lines_smooth.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + 
		geom_line(aes(y=Value, x=Pred, group=Method,color=Method)) +
		stat_smooth(aes(y=Value, x=Pred, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")


print("melt avg preds info as dots and smooth function")
svg(paste(outputPath,"ducp_ucp_err_plot_dots_smooth.svg", sep="/"), width=6, height=4)
ggplot(meltAvgPreds) + 
		geom_point(aes(x=Pred, y=Value, group=Method,color=Method,shape=Method),size=1.5) +
		scale_shape_manual(values=c(0,1,2,3))+
		stat_smooth(aes(x=Pred, y=Value, group=Method,color=Method), method = lm, formula = y ~ poly(x, 10), se = FALSE)+ xlab("Relative Deviation (%)") +
		ylab("Percentage")+ theme(legend.position="bottom")


# 10 fold cross validation of mmre, pred(.25), pred(.50)
# estimate the predication accuracy by n fold cross validation.
#Randomly shuffle the data
#useCaseData<-useCaseData[sample(nrow(useCaseData)),]
#Create 10 equally size folds
#nfold = 10
#folds <- cut(seq(1,nrow(useCaseData)),breaks=nfold,labels=FALSE)

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



#also have linear regression on sloc and normalized effort.
sink()

# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)