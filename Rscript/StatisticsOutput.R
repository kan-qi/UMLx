#!/usr/bin/env Rscript

# # arg1: input csv file path
# # arg2: output directory
library(e1071)
library(jsonlite)

args = commandArgs(trailingOnly=TRUE)
newFile = args[1]
outputDir <- args[2]

filenameDataframe <- read.csv(newFile, header=TRUE)
var1 <- sapply(filenameDataframe,is.numeric)
var2 <- filenameDataframe[,var1]
column_names_dataframe = vector("list")
filename <- deparse(substitute(filenameDataframe))
column_names <- colnames(var2)
for(i in 1:length(column_names)){
  column_names_dataframe[[i]] = (paste(filename,column_names[[i]],sep="$"))
}
json_output = vector("list",length(column_names_dataframe))
for(i in 1:length(column_names_dataframe)){
  column = eval(parse(text = column_names_dataframe[i]))
  mean_column = mean(as.numeric(column),na.rm = TRUE)
  var_column = var(as.numeric(column),na.rm = TRUE)
  quantile_column = quantile(as.numeric(column),na.rm = TRUE)
  kurtosis_column = kurtosis(as.numeric(column),na.rm = TRUE)
  json_output[[i]] <- list("column name" = column_names[i],statistics = list(mean=mean_column,variance= var_column,
                                                                             first_quartile=quantile_column[2],median=quantile_column[3],
                                                                             third_quartile=quantile_column[4],kurtosis=kurtosis_column))
}
# print to output directory
reportPath <- paste(outputDir,'statistics.json', sep='/')
sink(reportPath)
# write statistics in JSON format
print(jsonlite::toJSON(json_output,pretty = TRUE,auto_unbox = TRUE))
closeAllConnections()
