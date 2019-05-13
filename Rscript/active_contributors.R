# This script calculates the number of active contributors of an open source
# project using the Github API. Active contributors are defined as in:
# Software effort estimation based on open source projects: Case study of Github
# Information and Software Technology 92(2017)145-157

library(jsonlite)
library(httr)
library(stringr)

# Repository and github username/pw
url <- "https://api.github.com/repos/apache/carbondata"
user <- NULL
pw <- NULL

getTotalPages <- function(linkHeaderStr) {
  # Finds how many pages of results are contained in an API GET request.
  #
  # Args:
  #   linkHeaderStr: the character string in the link header
  # Returns:
  #   The number of pages
  matched <-
    stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
  as.integer(matched[, 2])
}


# Get a list of all the contributors to the project.
contributors <- list()
info <-
  GET(paste(url, "/contributors?page=1", sep = ''),
      authenticate(user, pw))
pages <- getTotalPages(info$headers$link)
for (i in seq(1:pages)) {
  resp <-
    GET(paste(url, "/contributors?page=", i, sep = ''),
        authenticate(user, pw))
  currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
  contributors[[i]] <- currentPage
}
contributors <- rbind_pages(contributors)

# Get a list of all the commits for the project up to the last 30 active days.
commits <- list()
info <-
  GET(paste(url, "/commits?page=1", sep = ''), authenticate(user, pw))
pages <- getTotalPages(info$headers$link)
activeDays <- NULL
for (i in seq(1:pages)) {
  resp <-
    GET(paste(url, "/commits?page=1", sep = ''),
        authenticate(user, pw))
  currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
  for (j in seq(1:nrow(currentPage))) {
    if (is.null(activeDays)) {
      activeDays <- c(as.Date(currentPage[j, "commit.committer.date"]))
    }
    else if (as.Date(currentPage[j, "commit.committer.date"]) != activeDays[length(activeDays)]) {
      activeDays <-
        c(activeDays, as.Date(currentPage[j, "commit.committer.date"]))
      if (length(activeDays) >= 30) {
        commits[[i]] <-
          currentPage[which(currentPage[, "commit.committer.date"] >= activeDays[length(activeDays)]),]
        break
      }
    }
  }
  if (length(activeDays) >= 30) {
    break
  }
  commits[[i]] <- currentPage
}
commits <- rbind_pages(commits)

# Contributors that exceed the average number of total contributions
exceedsAvgContributions <-
  contributors[which(contributors$contributions >= mean(contributors$contributions)),]

# Contributors that exceed more than 1 commit per day
onePerDay <- c()
for (i in seq(1:nrow(contributors))) {
  login <- contributors[i, "login"]
  numberAuthored <- 0
  for (j in seq(1:nrow(commits))) {
    if (commits[j, "author.login"] == login) {
      numberAuthored <- numberAuthored + 1
    }
  }
  if (numberAuthored/nrow(commits) >= 1) {
    onePerDay <- c(onePerDay, login)
  }
}

activeContributors <- length(intersect(exceedsAvgContributions$login, onePerDay))
inactiveContributors <- nrow(contributors) - activeContributors
