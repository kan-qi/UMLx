set.seed(1)

phuong <- data.frame(Eeff = rnorm(100,31))
phuong$Neff <- rnorm(100,19.7 + .36*phuong$Eeff)

# Create the lm object ahead of time
lm1 <- lm(Neff ~ Eeff, data = phuong)

# Create the character string that you want to print
tp <- sprintf("%s=%.1f + %.2f %s", all.vars(formula(lm1))[1],
  coef(lm1)[1], coef(lm1)[2], all.vars(formula(lm1))[2])

# Change the mypanel function to use the lm1 object
mypanel<-function(x,y,...){
  panel.xyplot(x, y, ...)
  panel.abline(lm1)
  panel.text(33,33,labels=tp)
}

library(lattice)

# and off we go.

xyplot(Neff~Eeff,data=phuong,panel=mypanel,
       col="black",
       pch=18,xlab="Energy efficiency (%)",
       ylab = "Nitrogen efficiency (%)", main="(a)")