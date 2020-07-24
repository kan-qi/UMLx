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

#Pre-precessing data.
clean_step <- function(dataset){
  #checks if there are missing values.
  sum(is.na(dataset))
  dataset[!complete.cases(dataset),] #checks the row of missing values.
  newdata <- na.omit(dataset) #delects the row of missing values 
  #since there are some other data entry problems.
  
  #removes duplicates columns.
  newdata <- newdata[, !duplicated(colnames(newdata))]

  #labels categorical variable.
  #newdata["Type"] <- apply(newdata["Type"], 1, function(x) if(x == "Website") 
    #1 else if (x == "Mobile App") 2 else if (x == " Tool") 3 else 4)
  newdata["Type"] <- as.numeric(as.factor(unlist(newdata["Type"])))
  
  #removes near zero variance columns.
  nzv_cols <- nearZeroVar(newdata) #returns the cols number of nearZeroVar
  data <- newdata[, -nzv_cols]
  
  #removes the first column - ID.
  data <- data[, -1]
  
  #removes columns without name.
  keep.cols <- names(data) %in% c("")
  data <- data[!keep.cols]
  
  #draws hist of Efforts to check if any outliers.
  #hist(data$Effort, breaks = 200, main = "Distribution of Effort",
       #xlab = "Effort")
  
  #resamples the dataset - removes ouliers.
  data_resample = data[data$Effort < 20000, ]

  return(data_resample)
}

data_resample <- clean_step(dataset)

#Initializing model.
ensemble_trees_model <- function(dataset){
  
  data_resample <- clean_step(dataset)
  
  #initializes ensemble_trees.
  ensemble_trees <- list()
  ensemble_trees$regression_cols <- colnames(dataset)
  ensemble_trees$dim <- colnames(data_resample[, colnames(data_resample)!="Effort"])

  return(ensemble_trees)
}

ensemble_trees <- ensemble_trees_model(dataset)

#Model Building - Random Forest.
m_fit.ensemble_trees <- function(ensemble_trees, dataset){
  #features Selection - Random Forest.
  set.seed(1234)
  
  clean_cols <- ensemble_trees$dim
  clean_data <- dataset[, clean_cols]
  data_resample <- clean_step(dataset)
  train <- data_resample

  #checks the importance of features
  rf.features = randomForest(Effort~., data = data_resample, mtry=3, 
                             importance = TRUE, na.action = na.omit)
  features_imp = round(importance(rf.features), 2)
  #varImpPlot(rf.features) #plots the features importance.
  
  #cross Validation for features selection.
  if (nrow(data_resample) >= 6){
    len <- length(data_resample)
    num <- seq(from = 1, to = len)
    myfeatures <- cbind(data_resample[, num], 
                       matrix(runif(10 * nrow(data_resample)), nrow(data_resample), 10))
    result <- rfcv(myfeatures, data_resample$Effort, cv.fold = 5)
    
    #check the numbers of most related features.
    l <- list()
    for (i in 1:length(result$predicted)){
      sum <- 0
      for (j in 1:length(result$predicted[[i]])){
        sum <- sum + abs(data_resample$Effort[j:j] - result$predicted[[i]][j:j])
      }
      l[[i]] <- sum
    }
    index <- which.min(unlist(l[1:(length(result$predicted)-1)]))
    n_features <- names(result$predicted[index])
    
    #plots the relation between error and number of variables.
    with(result, plot(n.var, error.cv, log="x", type="o", lwd = 2))
    
    #dec order to find top features.
    top_imp <- head(features_imp[order(-features_imp[,1]),], n = n_features) 
  }
  else {
    top_imp <- features_imp[, "%IncMSE"][features_imp[,"%IncMSE"] != "NaN"]
    top_imp <- data.matrix(top_imp)
  }
  #initiates ntree to check the appropriate number.
  rf_ntree <- randomForest(Effort~., data = data_resample, ntree = 100, 
                           importance = TRUE, proximity=TRUE)
  y <- plot(rf_ntree)
  tree_number <- which.min(y)
  
  #trains Random Forest model with the most important features.
  #formula depends on the top 6 measures output in function feature_selection.
  f <- "Effort~"
  for (i in 1: nrow(top_imp)){
    if (i == 1){
      f <- paste(f, rownames(top_imp)[i])
    }
    else if (i <= nrow(top_imp)){
      f <- paste(f, rownames(top_imp)[i], sep = " + ")
    }
  }
  formula <- as.formula(f)
  m.rf <- randomForest(formula, data = train, 
                       importance = TRUE, ntree = tree_number)
  ensemble_trees$m <- m.rf
  
  #saves model for reuse.
  saveRDS(m.rf, "tree_model.rds")
  return(ensemble_trees)
}

ensemble_trees <- m_fit.ensemble_trees(ensemble_trees, dataset)

#Prediction of the test data.  
m_predict.ensemble_trees <- function(ensemble_trees, test){
  set.seed(1234)
  #m.rf <- readRDS("tree_model.rds")
  m.rf <- ensemble_trees$m
  
  #predicts the results.
  pred <- predict(m.rf, test)
  return(pred)
}

pred <- m_predict.ensemble_trees(ensemble_trees, dataset)
