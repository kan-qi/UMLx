#sample command line argument
#"C:/Program Files/R/R-3.2.2/bin/Rscript" PlottingError_FromStepWiseRegressionOnEffort.R --args
#"public/output/modelsEvaluation.csv" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e" 



args = commandArgs(trailingOnly=TRUE)

inputPath=args[1];
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

#NewDataFrame
#InputData=data.frame(c(InputData[,c(3,5,6,7,9,11,13,14,16,18,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,44,47)]))
#Replacing all the undefined and NaN values to NA
#InputData[is.nan(InputData)]=NA_character_
#t
#InputData[InputData=='undefined']<-as.numeric(0)


#replace all Nan and NA values with 0
for(i in 1:ncol(NewDataFrame)){
	NewDataFrame[is.nan(NewDataFrame[,i]),i]<-as.numeric(0)
	NewDataFrame[is.na(NewDataFrame[,i]),i]<-as.numeric(0)
}


#plotting the error term
#install.packages('olsrr') 
library(olsrr)
library(ggplot2)
model=lm(Effort ~ .,data=NewDataFrame)
forward_model=ols_step_forward(model,details=TRUE) # by default p-value wil be 0.3
summary(forward_model)

RootMeanSquareError=forward_model$rmse
Predictors=forward_model$predictors
Plot_Data_Frame=data.frame(RootMeanSquareError,Predictors)
Plot_Data_Frame$Predictors=factor(Plot_Data_Frame$Predictors,levels=Plot_Data_Frame$Predictors)
ggplot(Plot_Data_Frame,aes(y=RootMeanSquareError,x=Predictors,group=1))+geom_line()+geom_point()


