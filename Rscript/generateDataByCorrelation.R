#!/usr/bin/env Rscript

data <- read.csv('temp.csv', header=TRUE)
n     <- 23                   # length of vector
rho   <- 0.2551                   # desired correlation = cos(angle)
theta <- acos(rho)             # corresponding angle
#x1    <- c(n, 1, 1)       # fixed given data
#x2    <- c(n, 2, 0.5)      # new random data
x1 <- data[,1]
x2 <- data[,2]
X     <- cbind(x1, x2)         # matrix
Xctr  <- scale(X, center=TRUE, scale=FALSE)   # centered columns (mean 0)

Id   <- diag(n)                               # identity matrix
Q    <- qr.Q(qr(Xctr[ , 1, drop=FALSE]))      # QR-decomposition, just matrix Q
P    <- tcrossprod(Q)          # = Q Q'       # projection onto space defined by x1
x2o  <- (Id-P) %*% Xctr[ , 2]                 # x2ctr made orthogonal to x1ctr
Xc2  <- cbind(Xctr[ , 1], x2o)                # bind to matrix
# Y    <- Xc2 %*% diag(1/sqrt(colSums(Xc2^2)))  # scale columns to length 1
Y <- Xc2
x <- Y[ , 2] + (1 / tan(theta)) * Y[ , 1]     # final new vector
cor(x1, x)
x3 = round(x+mean(x2), digits = 0)
print(x3)
print(mean(x3))