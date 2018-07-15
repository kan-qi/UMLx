#!/usr/bin/env Rscript

#arg1: accuracy evaluation url
#arg3: output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 3) {
	stop("At least 3 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==3) {
	# default output file
	args[4] = "./temp"
}

dataUrl1 <- args[1]
dataUrl2 <- args[2]
dataUrl3 <- args[3]
outputPath <- args[4]
reportPath <- paste(outputPath,'benjamini-hockberg-report.txt', sep='/')

#linearRegressionPlotPath <- paste(outputPath,'use-case-point-linear-regression-plot.png', sep='/')
#independentVariablesScatterPlotPath <- paste(outputPath,'use-case-point-independent-variable-scatter-plot.png', sep='/')

# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

library(lattice)
#library(latticeExtra)
# set the output file
#library(reshape)
#library(dplyr)

#for draw the density plots

#library(gridExtra)

sink(reportPath)

accuracyD1 <- read.csv(dataUrl1, header=TRUE)
accuracyD2 <- read.csv(dataUrl2, header=TRUE)
accuracyD3 <- read.csv(dataUrl3, header=TRUE)
#accuracyData <- accuracydata[c("Data_Set", "Data_Point", "Estimator", "M.", "P.(.15)", "P.(.25)", "P.(.50)", "P_AVG")]

#print(accuracyD1)

dfs <- list(accuracyD1, accuracyD2, accuracyD3)

t_tests <- as.data.frame(matrix(c(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0), nrow=3, ncol=4))
rownames(t_tests) <- c("d1", "d2", "d3")
colnames(t_tests) <- c("mmre", "pred15", "pred25", "pred50")
p_value_list <- data.frame(t_test=character(), p_value=double())

#p_value_list <- data.frame(t_test=c("mmre", "pred15", "pred25", "pred50", "mmre", "pred15", "pred25", "pred50", "mmre", "pred15", "pred25", "pred50"), p_value=c(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0))


for( i in 1:length(dfs)){
	df <- dfs[[i]];
	
#	print("mmre")
#	print(colnames(df))
	
	row <- paste("d", i, sep="")
	
	print(row)
	
	#print(df)
	
	t_tests[row, "mmre"]<- (t.test(df$bayesian_mmre, df$apriori_mmre, var.equal=FALSE, paired=FALSE))[['p.value']]
	#p_value_list[nrow(p_value_list)+1, ] = list(t_test=paste(row, "_mmre", sep=""), p_value=t_tests[row, "mmre"])
	p_value_list = rbind(p_value_list, list(t_test=paste(row, "_mmre", sep=""), p_value=t_tests[row, "mmre"]), stringsAsFactors=FALSE)
	
	t_tests[row, "pred15"] <- (t.test(df$bayesian_pred15, df$apriori_pred15, var.equal=FALSE, paired=FALSE))[['p.value']]
	p_value_list = rbind(p_value_list, list(t_test=paste(row, "_pred15", sep=""), p_value=t_tests[row, "pred15"]), stringsAsFactors=FALSE)
	
	t_tests[row, "pred25"] <- (t.test(df$bayesian_pred25, df$apriori_pred25, var.equal=FALSE, paired=FALSE))[['p.value']]
	p_value_list = rbind(p_value_list, list(t_test=paste(row, "_pred25", sep=""), p_value=t_tests[row, "pred25"]), stringsAsFactors=FALSE)
	
	t_tests[row, "pred50"] <- (t.test(df$bayesian_pred50, df$apriori_pred50, var.equal=FALSE, paired=FALSE))[['p.value']]
	p_value_list = rbind(p_value_list, list(t_test=paste(row, "_pred50", sep=""), p_value=t_tests[row, "pred50"]), stringsAsFactors=FALSE)
	
	print(t_tests)

}

print("t tests matrix")
print(t_tests)

print("p value list before sorting")
print(p_value_list)

sorted_p_value_list <- p_value_list[order(p_value_list$p_value),]

print("sorted p value list")
print(sorted_p_value_list)

# false discovery rate
q <- 0.25
rank <- seq(1, nrow(sorted_p_value_list), by=1)

print("rank")
print(rank)

adjust_p_value <- (rank/nrow(sorted_p_value_list))*q

sorted_p_value_list$adjust_p_value <- adjust_p_value

print("adjusted p values")
print(sorted_p_value_list)

last_index = 0
for(i in 1:nrow(sorted_p_value_list)){
	if(sorted_p_value_list[i, "p_value"] < sorted_p_value_list[i, "adjust_p_value"]){
		last_index = i
	}
}

print(last_index)
#also have linear regression on sloc and normalized effort.
sink()

