#!/usr/bin/env Rscript

# This script calculates the number of active contributors of an open source
# project using the Github API. Active contributors are defined as in:
# Software effort estimation based on open source projects: Case study of Github
# Information and Software Technology 92(2017)145-157
# After calculating the number of active and inactive contributors. The effort
# is simulated using simEffort().

#arg1: git url
#arg2: result output path

args = commandArgs(trailingOnly=TRUE)

if (length(args) < 1) {
	stop("At least 1 argument must be supplied (input file).", call.=FALSE)
} else if (length(args)==1) {
	# default output file
	args[2] = "./temp/git_effort_request_results.txt"
}

gitUrl <- args[1]
outputFile <- args[2]


library(jsonlite)
library(httr)
library(stringr)

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

getAllContributors <- function(url, user, pw) {
  # Gets a list of all contributors to a project.
  #
  # Args:
  #   url: The project's github URL
  #   user: Your github username
  #   pw: Your github password
  #
  # Returns:
  #   A dataframe containing all the contributors for that project.
  contributors <- list()
  info <- GET(paste(url, "/contributors?page=1", sep = ''), authenticate(user, pw))
  pages <- getTotalPages(info$headers$link)
  for (i in seq(1:pages)) {
    resp <- GET(paste(url, "/contributors?page=", i, sep = ''), authenticate(user, pw))
    currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
    contributors[[i]] <- currentPage
  }
  contributors <- rbind_pages(contributors)
  contributors
}

getAllCommits <- function(url, user, pw) {
  # Gets a list of all commits to a project.
  #
  # Args:
  #   url: The project's github URL
  #   user: Your github username
  #   pw: Your github password
  #
  # Returns:
  #   A dataframe containing all the commits for that project.
  commits <- list()
  info <-GET(paste(url, "/commits?page=1", sep = ''), authenticate(user, pw))
  pages <- getTotalPages(info$headers$link)
  for (i in seq(1:pages)) {
  resp <- GET(paste(url, "/commits?page=", i, sep = ''), authenticate(user, pw))
  currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
  commits[[i]] <- currentPage
  }
  commits <- rbind_pages(commits)
  commits <- commits[order(as.Date(commits$commit.committer.date)), ]
  commits
}

getActiveContributors <- function(url, user, pw) {
  # Gets a list of all active/inactive contributors every 30 active days for a project.
  #
  # Args:
  #   url: The project's github URL
  #   user: Your github username
  #   pw: Your github password
  #
  # Returns:
  #   A list of active/inactive users every 30 active days.
  active <- list()
  commits <- getAllCommits(url, user, pw)
  currentMonthActiveDays <- c()
  currentMonthCommitCounts <- c()
  lifetimeCommitsCounts <- c()
  for (i in seq(1:nrow(commits))) {
    commitAuthor <- if (is.na(commits[i, "author.login"])) commits[i, "commit.committer.name"] else commits[i, "author.login"]
    if (length(currentMonthActiveDays) >= 30) {
      # Record the active/inactive contributors for this month
      activeThisMonth <- names(currentMonthCommitCounts[currentMonthCommitCounts / 30 >= 1])
      activeCurrentLifetime <- names(lifetimeCommitsCounts[lifetimeCommitsCounts >= mean(lifetimeCommitsCounts)])
      activeUsers = intersect(activeThisMonth, activeCurrentLifetime)
      inactiveUsers = setdiff(names(currentMonthCommitCounts), activeUsers)
      active[[length(active) + 1]] <- list(active = activeUsers, inactive = inactiveUsers,  days = as.Date(currentMonthActiveDays, origin = "1970-01-01"))
      # Reset data for next month
      currentMonthActiveDays <- c()
      currentMonthCommitCounts <- c()
    }
    # Updating current month commit counts
    if (commitAuthor %in% names(currentMonthCommitCounts)) {
      currentMonthCommitCounts[commitAuthor] <-
        currentMonthCommitCounts[commitAuthor] + 1
    }
    else {
      currentMonthCommitCounts[commitAuthor] <- 1
    }
    # Updating current lifetime commit counts
    if (commitAuthor %in% names(lifetimeCommitsCounts)) {
      lifetimeCommitsCounts[commitAuthor] <-
        lifetimeCommitsCounts[commitAuthor] + 1
    }
    else {
      lifetimeCommitsCounts[commitAuthor] <- 1
    }
    # Updating active days
    if (!dateInActiveDays(as.Date(commits[i, "commit.committer.date"]), currentMonthActiveDays)) {
      currentMonthActiveDays <-
        c(currentMonthActiveDays, as.Date(commits[i, "commit.committer.date"]))
    }
  }
  active
}

simEffort <- function(url, user, pw) {
  # Simulates effort of given GitHUb repository based on active and inactive
  # contributors.
  #
  # Args:
  #   url: the repo's github api url to simulate
  #   user: your github username
  #   pw: your github pw
  #
  # Returns:
  #   Effort in person-hours
  activeContributors <- getActiveContributors(url, user, pw)
  effort <- 0
  for (i in 1:length(activeContributors)) {
    effort <- effort + (length(activeContributors[[i]]$active)*152) + (length(activeContributors[[i]]$inactive)*51)
  }
  effort
}

sink(outputFile)

#effortResult <- simEffort("https://api.github.com/repos/apache/carbondata", "flyqk", "qk@github/910304")

effortResult <- simEffort(gitUrl, "flyqk", "qk@github/910304")

print(effortResult);

sink()