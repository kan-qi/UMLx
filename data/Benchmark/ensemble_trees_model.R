#library(rpart)
#library(rpart.plot)
#library(maptree)
#library(tree)
#library(cluster)
library(lattice)
library(ggplot2)
library(caret)
library(randomForest)

#Loading dataset.
load_data <- function(file){
  dataset <- read.table(file, header = TRUE, sep = ",", 
                        check.names = FALSE, fill = TRUE)
  return(dataset)
}

dataset <- load_data("/Users/Shared/Relocated Items/Security/Rachel/Study/USC/Coursework/Directed Research/git/data/Benchmark/dsets/D1.csv")
dataset <- load_data("/Users/Shared/Relocated Items/Security/Rachel/Study/USC/Coursework/Directed Research/git/data/Benchmark/dsets/D2.csv")
dataset <- load_data("/Users/Shared/Relocated Items/Security/Rachel/Study/USC/Coursework/Directed Research/git/data/Benchmark/dsets/D3.csv")
dataset <- load_data("/Users/Shared/Relocated Items/Security/Rachel/Study/USC/Coursework/Directed Research/git/data/Benchmark/dsets/D4.csv")

#Pre-processing data and Initializing model.
regression_tree_model <- function(dataset){
  #checks if there are missing values.
  sum(is.na(dataset))
  dataset[!complete.cases(dataset),] #checks the row of missing values.
  newdata <- na.omit(dataset) #delects the row of missing values 
  #since there are some other data entry problems.
   
  #removes duplicates columns.
  newdata <- newdata[, !duplicated(colnames(newdata))]
  
  #select numeric data only.
  #num_cols <- unlist(lapply(newdata, is.numeric))
  #data_num <- newdata[, num_cols]
  
  #labels categorical variable.
  newdata["Type"] <- apply(newdata["Type"], 1, function(x) if(x == "Website") 1 else if (x == "Mobile App") 2 else if (x == " Tool") 3 else 4)
  
  #removes near zero variance columns.
  nzv_cols <- nearZeroVar(newdata) #returns the cols number of nearZeroVar
  data <- newdata[, -nzv_cols]
  
  #removes the first column - ID.
  data <- data[, -1]
  
  #removes columns without name.
  keep.cols <- names(data) %in% c("")
  data <- data[!keep.cols]
  
  #draws hist of Efforts to check if any outliers.
  hist(data$Effort, breaks = 200, main = "Distribution of Effort",
       xlab = "Effort")
  
  #resamples the dataset - removes ouliers.
  data_resample = data[data$Effort < 20000, ]
  
  #splits datasets into train and test - 80% for train, 20% for test.
  train.index <- sample(x = 1: nrow(data_resample), size = floor(0.8 * nrow(data_resample)))
  train = data_resample[train.index, ]
  test = data_resample[-train.index, ]
  
  #initializes reg_tree.
  reg_tree <- list()
  reg_tree$regression_cols <- data_resample
  reg_tree$train <- train
  reg_tree$test <- test
  
  return(reg_tree)
}

reg_tree <- regression_tree_model(dataset)
mode(reg_tree) #list

#Model Building - Random Forest.
m_fit.reg_tree <- function(reg_tree, dataset){
  #features Selection - Random Forest.
  set.seed(1234)
  
  data_resample <- reg_tree$regression_cols
  train <- reg_tree$train
  test <- reg_tree$test
  
  #checks the importance of features
  rf.features = randomForest(Effort~., data = data_resample, mtry=3, 
                             importance = TRUE, na.action = na.omit)
  features_imp = round(importance(rf.features), 2)
  #varImpPlot(rf.features) #plots the features importance.
  
  #cross Validation for features selection.
  len <- length(data_resample)
  num <- seq(from = 1, to = len)
  myfeatures <- cbind(data_resample[, num], 
                     matrix(runif(10 * nrow(data_resample)), nrow(data_resample), 10))
  result <- rfcv(myfeatures, data_resample$Effort, cv.fold = 5)
  
  #plots the relation between error and number of variables.
  with(result, plot(n.var, error.cv, log="x", type="o", lwd = 2))#selects top 6 features.
  
  top_imp <- head(features_imp[order(-features_imp[,1]),]) #dec order to find top 6 features.
  
  #initiates ntree to check the appropriate number.
  rf_ntree <- randomForest(Effort~., data = data_resample, ntree = 100, 
                           importance = TRUE, proximity=TRUE)
  plot(rf_ntree) #treesize = 40
  
  #trains Random Forest model with the most important features.
  #formula depends on the top 6 measures output in function feature_selection.
  f <- "Effort~"
  for (i in 1: nrow(top_imp)){
    if (i == 1){
      f <- paste(f, rownames(top_imp)[i])
    }
    else if (i <= 6){
      f <- paste(f, rownames(top_imp)[i], sep = " + ")
    }
  }
  formula <- as.formula(f)
  m.rf <- randomForest(formula, data = train, 
                       importance = TRUE, ntree = 40)
  reg_tree$m <- m.rf
  
  #saves model for reuse.
  saveRDS(m.rf, "tree_model.rds")
  return(reg_tree)
}

m_fit.reg_tree(reg_tree, dataset)

#Prediction of the test data.  
m_predict.reg_tree <- function(reg_tree){
  set.seed(1234)
  test <- reg_tree$test
  m.rf <- readRDS("tree_model.rds")
  
  #predicts the results.
  pred <- predict(m.rf, test)
  sum <- 0
  for(i in 1:nrow(test)){
    sum <- sum + abs(test[i:i, 1:1] - pred[i:i])
  }
  
  #returns the average errors of the predictions.
  avg_error = sum/nrow(test)
  return(avg_error)
}
m_predict.reg_tree(reg_tree)

