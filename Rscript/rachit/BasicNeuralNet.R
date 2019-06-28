#!/usr/bin/env Rscript
library(neuralnet)
setwd("C:/Users/vimal/Documents/DR_machine_learning")
df <- read.csv("UCP_DatasetV1.8.csv",header = TRUE)
#print("Training Set")
#print(df[,7:9])
#ex <- df[,c(7,8,9)]
#print(ex)
#print(df)
#df1 <- read.csv("UCP_DatasetV1.8.csv",header = TRUE,nrows=10,skip=11)
#print("validation Set")
#print(df1)
#df2 <- read.csv("UCP_DatasetV1.8.csv",header = TRUE,nrows=10,skip=21)
#print("Test Set")
#print(df2)


N <- 9
D <- 3 # dimensionality(As we are selecting 6 levels ofcomplexity)(Now 3)
X1 <- df[1:9,c(8,15)] # data matrix (each row = single example)(Input data)
X1_TEST <- df[10,c(8,15)]

X2 <- df[11:19,c(8,15)] # data matrix (each row = single example)(Input data)
X2_TEST <- df[20,c(8,15)]

X3 <- df[21:29,c(8,15)] # data matrix (each row = single example)(Input data)
X3_TEST <- df[30,c(8,15)]

n <- names(X1)
#print(n)

f <- as.formula(paste("Real_Effort_Person_Hours ~ ", paste(n[!n %in% "Real_Effort_Person_Hours"], collapse= "+"))) #making a formula to fit to neural net

nn <- neuralnet(f,data=X1[1:9,],hidden=c(1),linear.output=T) #model with one hidden layer and one neuron

plot(nn)

pr.nn <- compute(nn,X1_TEST[,1])
MSE.nn1 <- (X1_TEST[1,2] - pr.nn$net.result)^2
print("First iteration MSE:")
print(MSE.nn1)

nn2 <- neuralnet(f,data=X2[1:9,],hidden=c(1),linear.output=T) #model with one hidden layer and one neuron

plot(nn2)

pr.nn2 <- compute(nn2,X2_TEST[,1])
MSE.nn2 <- (X2_TEST[1,2] - pr.nn2$net.result)^2


print("Second iteration MSE:")
#print(X2_TEST[1,4])
#print(pr.nn2$net.result)
print(MSE.nn2)

nn3 <- neuralnet(f,data=X3[1:9,],hidden=c(1),linear.output=T) #model with one hidden layer and one neuron

plot(nn3)

pr.nn3 <- compute(nn3,X3_TEST[,1])
MSE.nn3 <- (X3_TEST[1,2] - pr.nn3$net.result)^2

print("Third iteration MSE:")
print(MSE.nn3)

