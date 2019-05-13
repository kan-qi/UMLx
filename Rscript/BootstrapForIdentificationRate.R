#!/usr/bin/env Rscript

#arg1: data url
#arg2: summary output path
#arg3: plot output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).n", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp"
}

dataUrl <- args[1]
outputPath <- args[2]

# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries

library(lattice)
# set the output file

# Bootstrap 95% CI for regression coefficients 
library(boot)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset

modelEvaluation <- read.csv(dataUrl, header=TRUE)
intData = modelEvaluation[c('INT', 'INT_ALY')]
dmData = modelEvaluation[c('DM', 'DM_ALY')]
ctrlData = modelEvaluation[c('CTRL', 'CTRL_ALY')]
extivkData = modelEvaluation[c('EXTIVK', 'EXTIVK_ALY')]
extcllData = modelEvaluation[c('EXTCLL', 'EXTCLL_ALY')]
tnData = modelEvaluation[c('TN', 'TN_ALY')]

# Bootstrap 95% CI for R-Squared
# function to obtain R-Squared from the data
# the statistic to evaluate interface, data, control, external invocation, external call, transaction are the same.
# all are for relative error percentage.
# there are two element in each record. The first one is the actual, the second one is from analysis.
rsq <- function(formula, data, indices) {
  d <- data[indices,] # allows boot to select sample
  mres <- c() ### an empty vector 
  i <- 0
    for (i in 1:nrow(d)) {
    	actualVal <- d[i,1]
    	analyticVal <- d[i,2]
    	if(actualVal == 0){
    		mre <- abs(analyticVal-actualVal)
    	}
    	else{
    		mre <- abs(analyticVal-actualVal)/actualVal
    	}
        mres[i] <- mre
    }
  #print(d)
  #print('iteration')
  #print('itertion')
  pred <- c()
  pred15 <- 0
  pred25 <- 0
  pred50 <- 0
  n <- 0
  	for (mre in mres){
  		if(mre <= 0.15){
  			pred15 = pred15 + 1
  		}

  		if(mre <= 0.25){
  			pred25 = pred25 + 1
  		}

  		if(mre <= 0.5){
  			pred50 = pred50 + 1
  		}
  		n <- n+1
  	}
  pred[1] = pred15/n
  pred[2] = pred25/n
  pred[3] = pred50/n
  return(pred)
}
# view results
#results

#transaction number bootstrap
sink(paste(outputPath, 'transaction_num_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=tnData, statistic=rsq, R=1000, formula='')

print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'tn_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'tn_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'tn_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}

#interface management bootstrap
sink(paste(outputPath, 'interface_management_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=intData, statistic=rsq, R=1000, formula='')

print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'int_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'int_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'int_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}

#data management bootstrap
sink(paste(outputPath, 'data_management_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=dmData, statistic=rsq, R=1000, formula='')

print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'dm_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'dm_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'dm_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}

#control operation bootstrap
sink(paste(outputPath, 'control_operation_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=ctrlData, statistic=rsq, R=1000, formula='')

print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'ctrl_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'ctrl_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'ctrl_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}


#external invocation bootstrap
sink(paste(outputPath, 'external_invocation_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=extivkData, statistic=rsq, R=1000, formula='')

print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'extivk_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'extivk_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'extivk_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}

#external call bootstrap
sink(paste(outputPath, 'external_call_bootstrap_report.txt', sep='/'))
# bootstrapping with 1000 replications 
results <- boot(data=extcllData, statistic=rsq, R=1000, formula='')

print(results)

if(results$t0[1] != 0){
	svg(paste(outputPath, 'extcll_pred15_plot.svg', sep='/'))
	plot(results, index=1) # intercept
}

if(results$t0[2] != 0){
	svg(paste(outputPath, 'extcll_pred25_plot.svg', sep='/'))
	plot(results, index=2) # wt
}

if(results$t0[3] != 0){
	svg(paste(outputPath, 'extcll_pred50_plot.svg', sep='/'))
	plot(results, index=3) # disp
}

print("Bootstrap Results:")
if(results$t0[1] != 0){
# get 95% confidence intervals 
	print("Evaluation for pred(.15)")
	boot.ci(results, type="bca", index=1) # pred(.15)
}

if(results$t0[2] != 0){
	print("Evaluation for pred(.25)")
	boot.ci(results, type="bca", index=2) # pred(.25)
}

if(results$t0[3] != 0){
	print("Evaluation for pred(.50)")
	boot.ci(results, type="bca", index=3) # pred(.50)
}



#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)