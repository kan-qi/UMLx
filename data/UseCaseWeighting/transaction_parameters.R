# This script performs search for the optimal model in predicting effort from
# software size. The measure of software size used is the sum of weighted
# transactions calculated in the following manner:
# 1. Discretize the transaction data based on quantiles of a normal distribution
#    obtained from aggregate data.
# 2. Classify each transaction based on the quantile it falls in.
# 3. Count the number of points that fall into each quantile and apply weights.
# 4. Sum all the weights.
# This script determines the optimal number of bins and the weights to apply
# using linear regression and k-fold cross validation.
#
# Usage:
#   1. Put all the transaction analytics files into a folder.
#   2. Construct a data frame with the effort values.
#   3. Call performSearch() with desired arguments.
#   4. Examine the object returned by performSearch().
#       Ex. results <- performSearch(4, "./Transaction Data", effort)
#       a. Return the mean MSE result for i bins: results[[i]]$MSE
#       b. Return the weights results for i bins: results[[i]]$model
#       c. Return the discretization/classification data for i bins: results[[i]]$data

combineData <- function(folder) {
  # Combines all the data from multiple transaction analytics files into one
  # data frame.
  #
  # Args:
  #   folder: folder containing all the files
  #
  # Returns:
  #   A data frame containing all the data in all the files.
  data <- NULL
  for (file in dir(folder)) {
    filepath <- paste(folder, file, sep="/")
    if (is.null(data)) {
      data <- read.csv(filepath)[, -c(1)]
    }
    else {
      new <- read.csv(filepath)[, -c(1)]
      data <- rbind(data, new)
    }
  }
  data
}

discretizeAndClassify <- function(data, mean, sd, n) {
  # Discretizes and classify data into different levels of complexity based on
  # the quantile the data falls in the Normal(mean, sd) distribution.
  #
  # Args:
  #   data: a vector of data to discretize and classify
  #   mean: mean of the normal distribution to use
  #   sd: sd of the normal distribution to use
  #   n: number of bins to classify into
<<<<<<< HEAD
  
=======
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
  #
  # Returns:
  #   A vector of length n that indicates how many data points fall into each bin.
  if (n <= 1) {
    return(length(data))
  }
  quantiles <- seq(1/n, 1 - (1/n), 1/n)
  cutPoints <- qnorm(quantiles, mean, sd, lower.tail = TRUE)
  classifications <- cut(data, c(-Inf, cutPoints, Inf), labels = FALSE)
  result <- vector(length = n)
  for (i in seq(1, n)) {
    result[i] = sum(classifications == i)
    if (is.na(result[i])) {
      result[i] = 0
    }
  }
  result
}

crossValidate <- function(data, k) {
  # Performs k-fold cross validation with linear regression as training method.
  #
  # Args:
  #   data: the data to perform cross-validation with
  #   k: number of folds to use
  #
  # Returns:
  #   The mean MSE for all folds.
  folds <- cut(seq(1, nrow(data)), breaks = k, labels = FALSE)
  foldMSE <- vector(length = k)
  for (i in 1:k) {
    testIndexes <- which(folds == i, arr.ind = TRUE)
    testData <- data[testIndexes, ]
    trainData <- data[-testIndexes, ]
    model <- lm(Effort ~ ., data = trainData)
    predicted <- predict.lm(model, newdata = testData)
    foldMSE[i] <- mean((predicted - testData$Effort)^2)
  }
  mean(foldMSE)
}

performSearch <- function(n, folder, effortData, parameter = "TL", k = 5) {
  # Performs search for the optimal number of bins and weights to apply to each
  # bin through linear regression.
  #
  # Args:
  #   n: Specifies up to how many bins to search.
  #   folder: Folder containg all the transaction analytics data to analyze.
  #   effortData: a data frame containing effort data corresponding to each of
  #               the files contained in the folder argument. Rows must be named
  #               the same as the filename and effort column should be named "Effort".
  #   parameter: Which parameter to analyze. Ex. "TL", "TD", "DETs"
  #   k: How many folds to use for k-fold cross validation.
  #
  # Returns:
  #   A list in which the ith index gives the results of the search for i bins.
  combinedData <- combineData(folder)
  paramAvg <- mean(combinedData[, parameter])
  paramSD <- sd(combinedData[, parameter])
  searchResults <- list()
  for (i in seq(1,n)) {
    regressionData <- matrix(nrow = length(dir(folder)), ncol = i + 1)
    colnames(regressionData) <- c(paste("l", seq(1,i), sep = ""), "Effort")
    rownames(regressionData) <- dir(folder)
    print("regression data")
    print(regressionData)
    for (file in dir(folder)) {
      fileData <- read.csv(paste(folder, file, sep = "/"))
      regressionData[file, ] <- c(discretizeAndClassify(fileData[, parameter], paramAvg, paramSD, i), effortData[file, "Effort"])
    }
    regressionData <- as.data.frame(regressionData)
    print(regressionData)
    searchResults[[i]] <- list(MSE = crossValidate(regressionData, k), model = lm(Effort ~ ., regressionData), data = regressionData)
  }
  searchResults
}

# Construct effort data frame (may be easier to just make a csv for this and read it).
effort <- as.data.frame(matrix(c(263, 268.5, 1482.5, 1392, 804.5, 3113, 1592), nrow = 7, ncol = 1))
colnames(effort) <- c("Effort")
rownames(effort) <- c("F14a_REFERsy.csv", 
                      "F14a_soccer_data_web_crawler.csv", 
                      "F15a_construction_meeting_minutes_application.csv",
                      "s16_bad_driver.csv",
                      "S16b_flower_seeker.csv",
                      "s16b_Picshare_AA.csv",
                      "s16b_Picshare_RA.csv")

# Perform search
results <- performSearch(6, "./Transaction Data", effort)

print("search results")
print(results)