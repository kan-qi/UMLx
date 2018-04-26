data <- read.csv('/Users/mohit/Development/My Scripts/modelsEvaluation.csv',stringsAsFactors= T)
summary(data)
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
x$Type[5] = 1
x$Type[7] = 1
x$Type[20] = 3
x$Type = as.numeric(x$Type)

y =data$Effort
summary(x)

corr <- cor(x,y)
plot(corr,xlim=c(0, 36))
text(1:35,corr,row.names(corr),cex=0.4, pos=4, col="blue")
abline(h=0.6,col="red")

independentVar <- data.frame(x$KSLOC,x$UEUCW_ALY,x$UEXUCW_ALY,x$UDUCW_ALY,x$Effort_Norm_UCP,x$Path_Num,x$DUCP_ALY,x$EXUCP_ALY,x$EUCP_ALY,x$INT_ALY,x$DM_ALY,x$CTRL_ALY,x$NWT_DE_ALY,x$NWT_ALY)

names(independentVar)<- c("KSLOC","UEUCW_ALY","UEXUCW_ALY","UDUCW_ALY","Effort_Norm_UCP","Path_Num","DUCP_ALY","EXUCP_ALY","EUCP_ALY","INT_ALY","DM_ALY","CTRL_ALY","NWT_DE_ALY","NWT_ALY")

#library(caret)
#set.seed(30)
#model <- train(y~.,data=independentVar,method="lm",trControl = trainControl(method = "cv", number=2,verboseIter = TRUE))

fit <- lm(y~.,data=independentVar)
summary(fit)

