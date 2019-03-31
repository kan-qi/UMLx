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
#print(df)
X1 <- df[1:9,c("Simple_UC","Average_UC","Complex_UC","Real_Effort_Person_Hours")] # data matrix (each row = single example)(Input data)
#print(X1)
X1_TEST <- df[10,c("Simple_UC","Average_UC","Complex_UC","Real_Effort_Person_Hours")]

X2 <- df[11:19,c("Simple_UC","Average_UC","Complex_UC","Real_Effort_Person_Hours")] # data matrix (each row = single example)(Input data)
X2_TEST <- df[20,c("Simple_UC","Average_UC","Complex_UC","Real_Effort_Person_Hours")]

X3 <- df[21:29,c("Simple_UC","Average_UC","Complex_UC","Real_Effort_Person_Hours")] # data matrix (each row = single example)(Input data)
X3_TEST <- df[30,c("Simple_UC","Average_UC","Complex_UC","Real_Effort_Person_Hours")]

n <- names(X1)


print("Step-wise Feature selection")

num_columns <- ncol(X1)
num_columns <- num_columns-1

for (i in 1:num_columns){
  #############################################################################
  X1_temp_train <- X1
  X1_temp_train[i] <- NULL
  #print(X1_temp_train)
  n <- names(X1_temp_train)
  #print(n)
  
  f <- as.formula(paste("Real_Effort_Person_Hours ~ ", paste(n[!n %in% "Real_Effort_Person_Hours"], collapse= "+"))) #making a formula to fit to neural net
  
  nn <- neuralnet(f,data=X1_temp_train[1:9,],hidden=c(1),linear.output=T) #model with one hidden layer and one neuron
  
  plot(nn)
  
  X1_TEST_temp <- X1_TEST
  X1_TEST_temp[i] <- NULL 
  pr.nn <- compute(nn,X1_TEST_temp[,1:num_columns-1])
  MSE.nn1 <- (X1_TEST[1,c("Real_Effort_Person_Hours")] - pr.nn$net.result)^2
  print("Step wise removal of features First iteration MSE")
  print(MSE.nn1)
  
  X2_temp_train <- X2
  X2_temp_train[i] <- NULL
  #print(X2_temp_train)
  nn2 <- neuralnet(f,data=X2_temp_train[1:9,],hidden=c(1),linear.output=T) #model with one hidden layer and one neuron
  
  plot(nn2)
  
  X2_TEST_temp <- X2_TEST
  X2_TEST_temp[i] <- NULL 
  pr.nn2 <- compute(nn2,X2_TEST_temp[,1:num_columns-1])
  MSE.nn2 <- (X2_TEST_temp[1,c("Real_Effort_Person_Hours")] - pr.nn2$net.result)^2
  
  
  print("Second iteration MSE:")
  #print(X2_TEST[1,4])
  #print(pr.nn2$net.result)
  print(MSE.nn2)
  
  X3_temp_train <- X3
  X3_temp_train[i] <- NULL
  #print(X3_temp_train)
  nn3 <- neuralnet(f,data=X3_temp_train[1:9,],hidden=c(1),linear.output=T) #model with one hidden layer and one neuron
  
  plot(nn3)
  
  X3_TEST_temp <- X3_TEST
  X3_TEST_temp[i] <- NULL
  pr.nn3 <- compute(nn3,X3_TEST_temp[,1:num_columns-1])
  MSE.nn3 <- (X3_TEST_temp[1,c("Real_Effort_Person_Hours")] - pr.nn3$net.result)^2
  
  print("Third iteration MSE:")
  print(MSE.nn3)
  
  
  ################################################################################
}
