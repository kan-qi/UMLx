#!/usr/bin/env Rscript

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 2) {
	stop("At least 2 arguments must be supplied (input file).", call.=FALSE)
} else if (length(args)==2) {
	# default output file
	args[3] = "./Temp"
}

cocomoDataUrl <- args[1]
codeMetricsDataUrl <- args[2]
outputPath <- args[3]
simulatedDataFilePath <- paste(outputPath,'simulated-data.csv', sep='/')
reportPath <- paste(outputPath,'risk-predication-data-simulation-report.txt', sep='/')

sink(reportPath)

n = 500

#process code metrics data
codeMetricsData<- read.csv(codeMetricsDataUrl, header=TRUE, sep=",")
codeMetricsData<- codeMetricsData[c("code_smells", "vulnerabilities")]

print(cov(codeMetricsData))

Sigma = cov(codeMetricsData)
temp = eigen(Sigma)
SqrtSigma = temp$vectors%*%diag(sqrt(temp$values))%*%t(temp$vectors)


simulatedCodeMetricsData = matrix(rep(c(NA,NA),n), ncol=2)
colnames(simulatedCodeMetricsData) <- c( "CSmell","SVul")
for(i in 1:n){
	simulatedCodeMetricsData[i,] = colMeans(codeMetricsData) + SqrtSigma%*%rnorm(2)
}

print(simulatedCodeMetricsData)

#process cocomo data
COCOMOData<- read.csv(cocomoDataUrl, header=TRUE, sep=",")
COCOMOData<- COCOMOData[c( "RELY","DATA","CPLX","RUSE","DOCU","TIME","STOR","PVOL","ACAP","PCAP","PCON","APEX","PLEX","LTEX","TOOL","SITE","SCED")]

#COCOMOData<- COCOMOData[c( "RELY","DATA","CPLX","RUSE","PVOL","ACAP","APEX")]

print(cov(COCOMOData))

Sigma1 = cov(COCOMOData)
temp1 = eigen(Sigma1)
SqrtSigma1 = temp1$vectors%*%diag(sqrt(temp1$values))%*%t(temp1$vectors)


simulatedCOCOMO = matrix(rep(c(NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA,NA),n), ncol = 17)
#simulatedCOCOMO = matrix(rep(c(NA,NA,NA,NA,NA,NA,NA),n), ncol = 7)
#colnames(simulatedCOCOMO) <- c( "RELY","DATA","CPLX","RUSE","PVOL","ACAP","APEX")
colnames(simulatedCOCOMO) <- c( "RELY","DATA","CPLX","RUSE","DOCU","TIME","STOR","PVOL","ACAP","PCAP","PCON","APEX","PLEX","LTEX","TOOL","SITE","SCED")
print(simulatedCOCOMO);
for(i in 1:n){
	simulatedCOCOMO[i,] = colMeans(COCOMOData) + SqrtSigma1%*%rnorm(7)
}

print(simulatedCOCOMO)

#process coqualmo data
simulatedCOQUALMOData= matrix(rep(c(NA,NA,NA),n), ncol = 3)
colnames(simulatedCOQUALMOData) <- c( "AA", "PR", "ETT")
print(simulatedCOQUALMOData);
for(i in 1:n){
	simulatedCOQUALMOData[i,] = c(1, 1, 1) + 0.15*rnorm(3)
}

#process quality management data
simulatedQualityManagementData= matrix(rep(c(NA,NA,NA,NA,NA),n), ncol = 5)
colnames(simulatedQualityManagementData) <- c( "FCR", "CD", "ISS", "ISRR", "DRR")
print(simulatedQualityManagementData);
for(i in 1:n){
	simulatedQualityManagementData[i,] = c(117, 299, 42, 762, 232) + n*rnorm(5)
}

print(simulatedQualityManagementData)

#process risk data
simulatedRiskData= matrix(rep(c(0,0,0,0,0),n), ncol = 5)
colnames(simulatedRiskData) <- c( "RISK1", "RISK2", "RISK3", "RISK4", "RISK5")
riskPick = sample(1:5,n,replace=T)
print(simulatedRiskData);
for(i in 1:n){
	simulatedRiskData[i,riskPick[i]] = 1
}

print(simulatedRiskData)

simulatedData <- cbind(simulatedCodeMetricsData, COCOMOData, simulatedCOQUALMOData, simulatedQualityManagementData, simulatedRiskData)
write.csv(simulatedData, simulatedDataFilePath)

#print(pairs(~CSmell+SVul+FCR+CD+ISS+ISRR+DRR+RELY+DATA+CPLX+RUSE+DOCU+TIME+STOR+PVOL+ACAP+PCAP+PCON+APEX+PLEX+LTEX+TOOL+SITE+SCED,data=simulatedData, main="Simple Scatterplot Matrix"))


png(paste(outputPath,"scatter_matrics_code_metrics.png", sep='/'))
print(pairs(~CSmell+SVul,data=simulatedData, main="Scatterplot Matrix for Code Metrics"))


png(paste(outputPath,"scatter_matrics_cocomo.png", sep='/'))
print(pairs(~RELY+DATA+CPLX+RUSE+DOCU+TIME+STOR+PVOL+ACAP+PCAP+PCON+APEX+PLEX+LTEX+TOOL+SITE+SCED,data=simulatedData, main="Scatterplot Matrix for COCOMO Variables"))

sink()