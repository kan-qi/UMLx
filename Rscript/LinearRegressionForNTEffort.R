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
reportPath1 <- paste(outputPath,'nt-linear-regression-report.txt', sep='/')
pngPath1 <- paste(outputPath,'nt-linear-regression-plot.png', sep='/')
reportPath2 <- paste(outputPath,'sloc-linear-regression-report.txt', sep='/')
pngPath2 <- paste(outputPath,'sloc-linear-regression-plot.png', sep='/')




# store the current directory
# initial.dir<-getwd()
# setwd(workDir)

# cat(initial.dir)
# change to the new directory
#cat(getwd())
# load the necessary libraries

library(lattice)
library(latticeExtra)
# set the output file
library(reshape)
#library(dplyr)

sink(reportPath1)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)
transactionalData <- data[c("Effort_Norm", "TN_ALY", "WTN_ALY", "WTNDC_ALY")]
#transactionalDataMelt <- gather(transactionalData, key=variable, value=value, TN_ALY, WTN_ALY, WTNDC_ALY)
transactionalDataMelt <- melt(transactionalData, id=c("Effort_Norm"))

print(transactionalDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and TN
print("correlation between effort and TN_ALY")
cor1 = cor(data$Effort_Norm, data$TN_ALY)
print("linear regression of effort on TN_ALY")
m1 = lm(Effort_Norm~TN_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
summary(m1)$r.squared
newx1 <- seq(-100, max(data$TN_ALY)+100, length.out=100)
pred1 = predict(m1,data.frame(TN_ALY=newx1), interval='confidence')
print(coeff1)

#correlation between effort and TN
print("correlation between effort and WTN")
cor2 = cor(data$Effort_Norm, data$WTN_ALY)
print("linear regression of effort on WTN_ALY")
#print(axis1)
m2 = lm(Effort_Norm~WTN_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff2 = summary(m2)$coefficients
summary(m2)$r.squared
newx2 <- seq(-100, max(data$WTN_ALY)+100, length.out=100)
pred2 = predict(m2,data.frame(WTN_ALY=newx2), interval='confidence')
print(coeff2)

#correlation between effort and TN
print("correlation between effort and WTNDC")
cor3 = cor(data$Effort_Norm, data$WTNDC_ALY)
print("linear regression of effort on WTNDC_ALY")
#print(axis1)
m3 = lm(Effort_Norm~WTNDC_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff3 = summary(m3)$coefficients
summary(m3)$r.squared
newx3 <- seq(-100, max(data$WTNDC_ALY)+100, length.out=100)
print(newx3)
pred3 = predict(m3, data.frame(WTNDC_ALY=newx3), interval='confidence')
print(pred3)
print(coeff3)

corArray = c(cor1, cor2, cor3)
mArray = c(m1, m2, m3)
coeffs = list(coeff1, coeff2, coeff3)
preds = list(pred1, pred2, pred3)
newxArray = list(newx1, newx2,newx3)
xPosArray = c(77, 725, 800)
#panel.ci <- function(x, y, interval=0.9) {	
#	require(lattice)
#	fit     <- lm(y ~ x, data=data.frame(x=x, y=y))
#	newX    <- data.frame(x=jitter(x))
#	fitPred <- predict.lm(fit, newdata=newX, interval=interval)
#	panel.lmline(x, y, ..., identifier = "lmline")
#	panel.xyplot(newX$x, fitPred[,2], type="a", lty=2)
#	panel.xyplot(newX$x, fitPred[,3], type="a", lty=2)
#}


plot = xyplot(Effort_Norm~ value | variable, data=transactionalDataMelt,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="Transactional Complexity", fontsize=10),
		ylab=list(label="Normalized Effort (PH)", fontsize=10),
		strip =strip.custom(factor.levels = c("NT","NWT - I","NWT - II")),
		#upper=data$upper,
		#lower=data$lower,
		scales=list(x=list(relation="free")),
		panel = function(x, y) {
			
			pred.c = preds[[panel.number()]]
			newx = newxArray[[panel.number()]]
			
			upper = pred.c[,3]
			lower = pred.c[,2]
			panel.polygon(c(rev(newx), newx), c(rev(upper), lower),  col = 'grey80', border = NA)
			
			panel.lines(newx, upper, lty = 'dashed', col = 'red')
			panel.lines(newx, lower, lty = 'dashed', col = 'red')
			
			panel.xyplot(x, y, grid = TRUE,
					type = c("p", "r"),
					col.line = "black")
			
			#upper <- upper[subscripts]
			#lower <- lower[subscripts]
			#panel.polygon(c(x, rev(x)), c(upper, rev(lower)), col = fill, border = FALSE)
			
			#lm.model <- lm(y ~ x) # Fit linear model
			#lm.model <- mArray[panel.number()]
			#panel.polygon(c(1:nrow(pred.c),nrow(pred.c):1), c(pred.c[, 2], rev(pred.c[, 3])), col = "grey", border = NA)
			#lines(1:nrow(pred.c), pred.c[, 2], col = 2, lty = 2, lwd = 2)
			#lx <- as.numeric(lower)
			#ux <- as.numeric(upper)
			#panel.lines(x, pred.c[, 3])
			#panel.arrows(lx, y, ux, y, col = 'black',
			#		length = 0.25, unit = "native",
			#		angle = 90, code = 3)
			
			#print(pred.c)
			#panel.ellipse(x, y)
			#panel.ci(x,y)
			#panel.superpose(x, y, panel.groups = function(x, y, upper, lower, fill, col, subscripts, ..., font, fontface){
			#			upper <- upper[subscripts]
			#			lower <- lower[subscripts]
			#			panel.polygon(c(x, rev(x)), c(upper, rev(lower)), col = fill, border = FALSE)
			#		}, type='l', col='gray')
			# Create the character string that you want to print
			#coefficients = summary(mArray[panel.number()])$coefficients;
			eq = bquote(paste("y=", beta[0],"+",beta[1],"x"))
			xPos = xPosArray[panel.number()]
			panel.text(xPos, 2620, eq, cex=0.8)
			coefficients = coeffs[[panel.number()]]
			#p0 <- sprintf("%s: %.2f SE:%.2f", "\beta_0)", coefficients[1, 1], coefficients[1, 2])
			p0.v = sprintf("%.2f",coefficients[1, 1])
			p0.se = sprintf("%.2f",coefficients[1, 2])
			p0 <- bquote(paste(beta[0],": ", .(p0.v)," SE: ",.(p0.se)))
			panel.text(xPos, 2450, p0, cex=0.8)
			#p1 <- expression(paste(beta[1],sprintf(": %.2f SE:%.2f", coefficients[2, 1], coefficients[2, 2])))
			p1.v = sprintf("%.2f",coefficients[2, 1])
			p1.se = sprintf("%.2f",coefficients[2, 2])
			p1 <- bquote(paste(beta[1],": ", .(p1.v)," SE: ",.(p1.se)))
			panel.text(xPos, 2290, p1, cex=0.8)
			r2 = bquote(paste(r, ": ", .(sprintf("%.2f",corArray[panel.number()]))))
			panel.text(xPos, 2150, r2, cex=0.7)
		},
		auto.key = TRUE,
		type = c("p", "r"))

# print(grid.arrange(plot1, plot2, plot3))
# dev.off()
png(filename=pngPath1,
		type="cairo",
		units="in", 
		width=4*3, 
		height=4*1,
		res=96)
print(plot)


#also have linear regression on sloc and normalized effort.
sink()
sink(reportPath2)

m = lm(Effort_Norm~KSLOC, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
summary(m)$coefficients

plot7 = xyplot(Effort_Norm~KSLOC, data,
		grid = TRUE,
		# scales = list(x = list(log = 10, equispaced.log = FALSE)),
		xlab=list(label="KSLOC", fontsize=8),
		#ylab=list(label=yLab2, fontsize=8),
		ylab=list(label="Effort_Norm", fontsize=8),
		auto.key = TRUE,
		type = c("p", "r"), lwd = 4)

png(filename=pngPath2, 
		type="cairo",
		units="in", 
		width=3*1, 
		height=3*1, 
		pointsize=10, 
		res=96)
print(plot7)

#axis2 = axis(4, pretty(range(data[, yLab2])), ylab=list(label=yLab2, fontsize=8))

#axis3 = axis(1, pretty(range(data[, xLab])))

#print(plot2)
#print(axis2)
#print(axis3)

#setwd(workDir)
# warnings()
# close the output file
sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)