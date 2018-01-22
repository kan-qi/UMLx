
#sample arguments line
# "C:/Program Files/R/R-3.2.2/bin/Rscript" TimeSeriesScript.R --args  "f14a_cash_doctor" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e/TrendingLine.csv" "public/output/repo598c93a9a9813b12105c953e/0005488ce4aee08d8512e74fca9e1b7e" 
#output is visualized in TimeSeries.svg file 
args = commandArgs(trailingOnly=TRUE)
# send model name as argument


if (length(args) < 2) {
	stop("At least two argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "."
}


input_project_name=args[1]
input_path=args[2]
output_dir=args[3] 
workDir="."
# store the current directory
initial.dir<-getwd()
setwd(workDir)

# cat(initial.dir)
# change to the new directory
cat(getwd())
# load the necessary libraries
library(lattice)
# set the output file

library(ggplot2)
Input=read.csv(input_path,header=TRUE)

Input=as.data.frame(Input)
input_project_name
a=Input$Project_name==input_project_name
a
SelectedRows=Input[Input$Project_name==input_project_name,]
svg(paste(output_dir,"TimeSeries.svg",sep="/"))
print(ggplot(SelectedRows,aes(x=Time_Recorded,group=1))+geom_line(aes(y=Number_Of_Paths))+ggtitle(input_project_name))
dev.off()