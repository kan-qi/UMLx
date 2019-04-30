#import datasheet
my_data1 <- read.csv('./kitchenham.csv',stringsAsFactors= T)
my_data2 <- read.csv('./Silhavy.csv',stringsAsFactors= T)
my_data3 <- read.csv('./cosmic.csv',stringsAsFactors= T)
my_data4 <- read.csv('./isbsg10.csv',stringsAsFactors= T)
my_data5 <- read.csv('./kemerer.csv',stringsAsFactors= T)
my_data6 <- read.csv('./china.csv',stringsAsFactors= T)
my_data7 <- read.csv('./albrecht.csv',stringsAsFactors= T)
my_data8 <- read.csv('./boetticher.csv',stringsAsFactors= T)
#my_data9 <- read.csv('./open_effort.csv',stringsAsFactors= T)
my_data10 <- read.csv('./maxwell.csv',stringsAsFactors= T)
my_data11<- read.csv('./miyazaki94.csv',stringsAsFactors= T)
my_data12 <- read.csv('./UMLx_d1_577.csv',stringsAsFactors= T)
my_data13 <- read.csv('./cocomonasa_2.csv',stringsAsFactors= T)


#turn the effort data of csv into data frame
effort1 <- data.frame(my_data1$Actual.effort)
colnames(effort1) <-c('val')

effort2 <- data.frame(my_data2$Real_Effort_Person_Hours)
colnames(effort2) <-c('val')

effort3 <- data.frame(my_data3$S_effort)
colnames(effort3) <-c('val')
effort3
effort4 <- data.frame(my_data4$S_effort)
colnames(effort4) <-c('val')

effort5 <- data.frame(my_data5$EffortMM)
colnames(effort5) <-c('val')

effort6 <- data.frame(my_data6$Effort)
colnames(effort6) <-c('val')

effort7 <- data.frame(my_data7$Effort)
colnames(effort7) <-c('val')

#effort8 <- data.frame(my_data8$act_effort)  no effort data
#colnames(effort8) <-c('val')

#effort9 <- data.frame(my_data9$act_effort)
#colnames(effort9) <-c('val')

effort10 <- data.frame(my_data10$Effort)
colnames(effort10) <-c('val')

effort11 <- data.frame(my_data11$MM)*156
colnames(effort11) <-c('val')

effort12 <- data.frame(my_data12$Effort)
colnames(effort12) <-c('val')

effort13 <- data.frame(my_data13$act_effort)
colnames(effort13) <-c('val')
library(ggplot2)

#mark the data using column values
effort1$dataset <- 'kitchenham'
effort2$dataset <- 'Silhavy'
effort3$dataset <- 'cosmic'
effort4$dataset <- 'isbsg10'
effort5$dataset <- 'kemerer'
effort6$dataset <- 'china'
effort7$dataset <- 'albrecht'
#effort8$short <- 'effort8'
#effort9$short <- 'effort9'
effort10$dataset <- 'maxwell'
effort11$dataset <- 'miyazaki94'
effort12$dataset <- 'UMLx_d1_577'
effort13$dataset <- 'cocomonasa_2'

#effort2$short <- 'effort2'

#combine the data into one
comparison2 <- rbind(effort1,effort2,effort3,effort4,effort5,effort6,effort7,effort10,effort11,effort12,effort13)
comparison2
#draw the plot with histgram and density curve combined
ggplot(comparison2, aes(val, fill = dataset)) + geom_density(alpha = 0.2) + geom_histogram(alpha = 0.5, aes(y = ..density..), position = 'identity') + xlim(0, 20000) + ylim(0,0.0035) + xlab("sloc") + ylab("project percentage")