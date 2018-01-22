

#sample command line argument
#"C:/Program Files/R/R-3.2.2/bin/Rscript" BootstrapOnStepwiseRegression_Effort.R --args
#"public/output/modelsEvaluation.csv" "public/output/" 



args = commandArgs(trailingOnly=TRUE)

inputPath=args[1];
outputPath=args[2];
library(lattice)
InputData=read.csv(inputPath,header=TRUE,stringsAsFactors=FALSE)
#str(InputData)
#install.packages('dummies')
library(dummies)
#considering only the numeric columns that are non zero and 'Type' column
list1=c(3,5,6,7,9,11,13,14,16,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,44,47)
NewDataFrame=as.data.frame(InputData[,list1])
#one hot encoding of the 'Type' column
NewDataFrame=dummy.data.frame(NewDataFrame,names=c("Type"),sep="_")
options(warn=-1) # supress warnings
# convert all columns to numerics 
for(i in seq(1,ncol(NewDataFrame)))
{
	NewDataFrame[,i]=as.numeric(NewDataFrame[,i])
}
for(i in 1:ncol(NewDataFrame)){
	NewDataFrame[is.nan(NewDataFrame[,i]),i]<-as.numeric(0)
	NewDataFrame[is.na(NewDataFrame[,i]),i]<-as.numeric(0)
}


#plotting the error term
#install.packages('olsrr') 
library(olsrr)
library(ggplot2)
model=lm(Effort ~ .,data=NewDataFrame)
forward_model=ols_step_forward(model) # by default p-value wil be 0.3

Predictors=as.list(forward_model$predictors)

ObtainedModel=lm(Effort~Effort_Norm_UCP+Norm_Factor+NWT_DE_ALY+RET+DM,data=NewDataFrame)
ObtainedModel

Predicted_Effort=predict(ObtainedModel,data=NewDataFrame)

Results_Data=data.frame(InputData[,"Effort"],Predicted_Effort)

#install.packages("boot")
library(boot)
#function to obtain R-Squared from the data
# all are for relative error percentage.
# there are two element in each record. The first one is the actual, the second one is from analysis.

rsq <- function(formula, data, indices) {
	indices
	d <- data[indices,] # allows boot to select sample\
	
	mres <- c() ### an empty vector 
	i <- 0
	for (i in 1:nrow(d)) {
		actualVal <- d[i,1]
		analyticVal <- d[i,2]
		if(actualVal == 0){
			mre <- abs(analyticVal-actualVal)
		}
		else{
			mre <- abs(analyticVal-actualVal)/actualVal
		}
		mres[i] <- mre
	}
	print(d)
	#print('iteration')
	#print('itertion')
	pred <- c()
	pred15 <- 0
	pred25 <- 0
	pred50 <- 0
	n <- 0
	for (mre in mres){
		if(mre <= 0.15){
			pred15 = pred15 + 1
		}
		
		if(mre <= 0.25){
			pred25 = pred25 + 1
		}
		
		if(mre <= 0.5){
			pred50 = pred50 + 1
		}
		n <- n+1
	}
	pred[1] = pred15/n
	pred[2] = pred25/n
	pred[3] = pred50/n
	return(pred)
}
sink(paste(outputPath, 'Effort_BootStrap_results_Using_stepwise.txt', sep='/'))
results <- boot(data=Results_Data, statistic=rsq, R=1000, formula='')
print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'Effort_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
	dev.off()
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'Effort_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
	dev.off()
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'Effort_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
	dev.off()
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}


