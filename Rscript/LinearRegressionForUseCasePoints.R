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
reportPath <- paste(outputPath,'use-case-point-linear-regression-report.txt', sep='/')
pngPath <- paste(outputPath,'use-case-point-linear-regression-plot.png', sep='/')




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

sink(reportPath)

# jpeg("effort_regression_plog.jpg")
# win.metafile("effort_regression_plog.wmf")
# png("effort_regression_plog.png")
# load the dataset


data <- read.csv(dataUrl, header=TRUE)
transactionalData <- data[c("Effort_Norm_UCP", "EUCP_ALY", "EXUCP_ALY", "DUCP_ALY")]
#transactionalDataMelt <- gather(transactionalData, key=variable, value=value, EUCP_ALY, EXUCP_ALY, DUCP_ALY)
transactionalDataMelt <- melt(transactionalData, id=c("Effort_Norm_UCP"))

print(transactionalDataMelt)

#print(plot1)

#axis1 = axis(2, pretty(range(data[,yLab1])))

#correlation between effort and EUCP
print("correlation between effort and EUCP_ALY")
cor1 = cor(data$Effort_Norm_UCP, data$EUCP_ALY)
print("linear regression of effort on EUCP_ALY")
m1 = lm(Effort_Norm_UCP~EUCP_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff1 = summary(m1)$coefficients
summary(m1)$r.squared
newx1 <- seq(-100, max(data$EUCP_ALY)+100, length.out=100)
pred1 = predict(m1,data.frame(EUCP_ALY=newx1), interval='confidence')
print(coeff1)

#correlation between effort and EXUCP
print("correlation between effort and EXUCP")
cor2 = cor(data$Effort_Norm_UCP, data$EXUCP_ALY)
print("linear regression of effort on EXUCP_ALY")
#print(axis1)
m2 = lm(Effort_Norm_UCP~EXUCP_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff2 = summary(m2)$coefficients
summary(m2)$r.squared
newx2 <- seq(-100, max(data$EXUCP_ALY)+100, length.out=100)
pred2 = predict(m2,data.frame(EXUCP_ALY=newx2), interval='confidence')
print(coeff2)

#correlation between effort and DUCP
print("correlation between effort and DUCP")
cor3 = cor(data$Effort_Norm_UCP, data$DUCP_ALY)
print("linear regression of effort on DUCP_ALY")
#print(axis1)
m3 = lm(Effort_Norm_UCP~DUCP_ALY, data=data)
#summary(m1.lm)$test[c("coefficients", "sigma", "tstat", "pvalues")]
coeff3 = summary(m3)$coefficients
summary(m3)$r.squared
newx3 <- seq(-100, max(data$DUCP_ALY)+100, length.out=100)
print(newx3)
pred3 = predict(m3, data.frame(DUCP_ALY=newx3), interval='confidence')
print(pred3)
print(coeff3)

corArray = c(cor1, cor2, cor3)
mArray = c(m1, m2, m3)
coeffs = list(coeff1, coeff2, coeff3)
preds = list(pred1, pred2, pred3)
newxArray = list(newx1, newx2,newx3)
xPosArray = c(77, 725, 800)

plot = xyplot(Effort_Norm_UCP~ value | variable, data=transactionalDataMelt,
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
png(filename=pngPath,
		type="cairo",
		units="in", 
		width=4*3, 
		height=4*1,
		res=96)
print(plot)


#also have linear regression on sloc and normalized effort.
sink()


#setwd(workDir)
# warnings()
# close the output file
#sink()
# unload the libraries
# detach("package:nlme")
# change back to the original directory
# setwd(initial.dir)