#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)

# arg1: analytical info file path
# arg2: output dir
# arg3: working directory

if (length(args) < 1) {
  stop("At least 1 arguments must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
  # default output file
  args[2] = "."
  args[3] = '.'
} else if (length(args) == 2){
  args[3] = '.'
}

analyticInfoPath = args[1]
outputDir <- args[2]
workDir <- args[3]
reportPath <- paste(outputDir,'analytical_info_statistics_report.txt', sep='/')
# store the current directory
initial.dir<-getwd()
#setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
sink(reportPath)
# set the output file
# cat(paste(args[3],"repo_analysis_result.svg", sep="/"))
# load the dataset
library(ggplot2)
library(data.table)
library(e1071)
library(jsonlite)


analyticalData <- read.csv(analyticInfoPath, header=TRUE)
var0 <- sapply(analyticalData, function(x) all(is.nan(x)))
analyticalDataNew <- analyticalData[,!var0] # remove columns containing NaN
var1 <- sapply(analyticalDataNew,is.numeric)
var2 <- analyticalDataNew[,var1]
column_names_dataframe = vector("list")
filename <- deparse(substitute(analyticalDataNew))
column_names <- colnames(var2)
for(i in 1:length(column_names)){
  column_names_dataframe[[i]] = (paste(filename,column_names[[i]],sep="$"))
}
list_column_names = vector("list",length(column_names_dataframe))

for(i in 1:length(column_names_dataframe)){
  column = eval(parse(text = column_names_dataframe[i]))
  #print(column)
  mean_column = mean(as.numeric(column),na.rm = TRUE)
  var_column = var(as.numeric(column),na.rm = TRUE)
  quantile_column = quantile(as.numeric(column),na.rm = TRUE)
  kurtosis_column = kurtosis(as.numeric(column),na.rm = TRUE)
  
  
  distPath <- paste(outputDir, paste(column_names[i], "distribution_chart.svg", sep='_'), sep='/')
  svg(distPath)
  print(hist(as.numeric(column), main="Num", xlab=column_names[i],breaks = 15))
  list_column_names[[i]] <- list("column name" = column_names[i],statistics = list(mean=mean_column,variance= var_column,
                                                                                   first_quartile=quantile_column[2],median=quantile_column[3],
                                                                                  third_quartile=quantile_column[4],kurtosis=kurtosis_column), "dist chart path" = distPath)
  dev.off() # to avoid too many open devices error
  }

# print to output directory
#reportPath <- paste(outputDir,'statistics.json', sep='/')
#sink(reportPath)
# write statistics in JSON format
print(jsonlite::toJSON(list_column_names,pretty = TRUE,auto_unbox = TRUE))
closeAllConnections()


#setwd(workDir)
# warnings()
# close the output file
# sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
setwd(initial.dir)
