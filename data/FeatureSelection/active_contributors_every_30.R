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

# Functions
getTotalPages <- function(linkHeaderStr) {
  # Finds how many pages of results are contained in an API GET request.
  #
  # Args:
  #   linkHeaderStr: the character string in the link header
  #
  # Returns:
  #   The number of pages
  matched <-
    stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
  as.integer(matched[, 2])
}

dateInActiveDays <- function(x, dates) {
  # Checks if a given day is in a vector of dates.
  #
  # Args:
  #   x: date to check
  #   dates: vector of dates to check
  #
  # Returns:
  #   TRUE if x is in dates, otherwise FALSE.
  answer = FALSE
  for (day in dates) {
    if (x == day) {
      answer = TRUE
    }
  }
  answer
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

# Get a list of all the commits for the project (may take a while).
commits <- list()
info <-
  GET(paste(url, "/commits?page=1", sep = ''), authenticate(user, pw))
pages <- getTotalPages(info$headers$link)
for (i in seq(1:pages)) {
  resp <-
    GET(paste(url, "/commits?page=", i, sep = ''),
        authenticate(user, pw))
  currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
  commits[[i]] <- currentPage
}
commits <- rbind_pages(commits)
commits <- commits[order(as.Date(commits$commit.committer.date)), ]

# Active contributors every 30 active days.
active <- list() # Stores a vector of active contributors every 30 active days
currentMonthActiveDays <- c()
currentMonthCommitCounts <- c()
lifetimeCommitsCounts <- c()
for (i in seq(1:nrow(commits))) {
  commitAuthor <- if (!is.na(commits[i, "author.login"])) commits[i, "author.login"] else commits[i, "commit.committer.name"]
  if (length(currentMonthActiveDays) >= 30) {
    # Record the active contributors for this month
    activeThisMonth <- c()
    activeCurrentLifetime <- c()
    for (entry in names(currentMonthCommitCounts)) {
      authorRate <- currentMonthCommitCounts[entry] / 30
      if (authorRate > 1) {
        activeThisMonth <- c(activeThisMonth, entry)
      }
      if (lifetimeCommitsCounts[entry] > mean(lifetimeCommitsCounts)) {
        activeCurrentLifetime <- c(activeCurrentLifetime, entry)
      }
    }
    if (length(intersect(activeThisMonth, activeCurrentLifetime)) > 0) {
      activeUsers = (intersect(activeThisMonth, activeCurrentLifetime))
      active[[length(active) + 1]] <- list(users = activeUsers, days = currentMonthActiveDays)
    }
    # Reset data for next month
    currentMonthActiveDays <- c()
    currentMonthCommitCounts <- c()
  }
  if (commitAuthor %in% names(currentMonthCommitCounts)) {
    currentMonthCommitCounts[commitAuthor] <- currentMonthCommitCounts[commitAuthor] + 1
  }
  else {
    currentMonthCommitCounts[commitAuthor] <- 1
  }
  if (commitAuthor %in% names(lifetimeCommitsCounts)) {
    lifetimeCommitsCounts[commitAuthor] <- lifetimeCommitsCounts[commitAuthor] + 1
  }
  else {
    lifetimeCommitsCounts[commitAuthor] <- 1
  }
  if (!dateInActiveDays(as.Date(commits[i, "commit.committer.date"]), currentMonthActiveDays)) {
    currentMonthActiveDays <- c(currentMonthActiveDays, as.Date(commits[i, "commit.committer.date"]))
  }
}
