data <- read.csv('/Users/mohit/Development/My Scripts/modelsEvaluation.csv',stringsAsFactors= T)
data$NT = ifelse(is.na(data$NT), ave(data$NT, FUN = function(x) mean(x, na.rm = TRUE)),data$NT)
data$INT_ALY = ifelse(is.na(data$INT_ALY), ave(data$INT_ALY, FUN = function(x) mean(x, na.rm = TRUE)),data$INT_ALY)
data$INT = ifelse(is.na(data$INT), ave(data$INT, FUN = function(x) mean(x, na.rm = TRUE)),data$INT)
data$DM = ifelse(is.na(data$DM), ave(data$DM, FUN = function(x) mean(x, na.rm = TRUE)),data$DM)
data$CTRL = ifelse(is.na(data$CTRL), ave(data$CTRL, FUN = function(x) mean(x, na.rm = TRUE)),data$CTRL)
data$EXTCLL = ifelse(is.na(data$EXTCLL), ave(data$EXTCLL, FUN = function(x) mean(x, na.rm = TRUE)),data$EXTCLL)
data$EXTIVK = ifelse(is.na(data$EXTIVK), ave(data$EXTIVK, FUN = function(x) mean(x, na.rm = TRUE)),data$EXTIVK)
x <-data[,7:45];
x$Type = factor(x$Type, levels = c('Web App', 'Mobile App', 'Mobile&Web App'),labels = c(1,2,3))
x$ILF<-NULL
x$EIF<-NULL
x$DET<-NULL
x$EF_ALY<-NULL
x$TCF_ALY<-NULL
x[20,30] <- 1
x[5,30] <- 2
x[7,30] <- 2
y =data$Effort

x1 = x[1:10,]
y1=y[1:10]

fit = lm(y1~.,data=x1)
summary(fit)
coefficients(fit)
fitted(fit)
anova(fit)
