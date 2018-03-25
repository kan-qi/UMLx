#!/usr/bin/env Rscript

# # arg1: element statistics file path
# # arg2: path staitstics file path
# # arg3: expanded path statistics file path
# # arg4: diagram statistics file path
# # arg5: output directory
library(e1071)
library(jsonlite)

args = commandArgs(trailingOnly=TRUE)

elementStatisticsPath = args[1]
pathStatisticsPath = args[2]
expandedPathStatisticsPath = args[3]
usecaseStatisticsPath = args[4]
outputDir <- args[5]

elementData <- read.csv(elementStatisticsPath, header=TRUE)
pathData <- read.csv(pathStatisticsPath, header=TRUE)
expandedPathData <- read.csv(expandedPathStatisticsPath, header=TRUE)
usecaseData <- read.csv(usecaseStatisticsPath, header=TRUE)
# columns names of integer datatype columns as (dataframe+$+column name) format
column_names = c("usecaseData$average_degree","usecaseData$average_path_length"
                 ,"usecaseData$architecture_difficulty","usecaseData$path_number",
                 "pathData$path_length","pathData$avg_degree","pathData$arch_diff",
                 "expandedPathData$path_length","elementData$outboundDegree",
                 "elementData$inboundDegree")
list_column_names = vector("list",length(column_names))
for(i in 1:length(column_names)){
  column = eval(parse(text = column_names[i]))
  mean_column = mean(as.numeric(column),na.rm = TRUE)
  var_column = var(as.numeric(column),na.rm = TRUE)
  quantile_column = quantile(as.numeric(column),na.rm = TRUE)
  kurtosis_column = kurtosis(as.numeric(column),na.rm = TRUE)
  list_column_names[[i]] <- list("column name" = column_names[i],statistics = list(mean=mean_column,variance= var_column,
                                                                   first_quartile=quantile_column[2],median=quantile_column[3],
                                                                   third_quartile=quantile_column[4],kurtosis=kurtosis_column))
}
# print to output directory
reportPath <- paste(outputDir,'statistics.json', sep='/')
sink(reportPath)
# write statistics in JSON format
print(jsonlite::toJSON(list_column_names,pretty = TRUE,auto_unbox = TRUE))
closeAllConnections()

