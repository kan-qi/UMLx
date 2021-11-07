#!/usr/bin/env Rscript
  
# This script calculates the number of active contributors of an open source
# project using the Github API. Active contributors are defined as in:
# Software effort estimation based on open source projects: Case study of Github
# Information and Software Technology 92(2017)145-157
# After calculating the number of active and inactive contributors. The effort
# is simulated using simEffort().


# import libraries
library(httr)
library(jsonlite)
library(openxlsx)
library(stringr)

# Variables
input_filename = "repos.xlsx"

# set user-agent
agent_user = "flyqk"
agent_password = "qk@github/910304"
authentication = authenticate(agent_user, agent_password)


convertToAPI <- function(repo_url) {
  # Converts Github repo URL to API URL.
  #
  # Args:
  #   repo_url: Github repository URL -> characters
  #
  # Returns:
  #   The converted URL -> characters
  
  api_path = "https://api.github.com/repos"
  extracted_repo_name = unlist(strsplit(as.character(repo_url), "https://github.com/"))[2]
  return(paste(api_path, extracted_repo_name, sep="/", collapse=NULL))
}


getTotalPages <- function(linkHeaderStr) {
  # Finds how many pages of results are contained in an API GET request.
  #
  # Args:
  #   linkHeaderStr: the character string in the link header
  #
  # Returns:
  #   The number of pages
  
  print(linkHeaderStr)
  totalPages = 1
  if (!is.null(linkHeaderStr)) {
    last_page <- stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
    totalPages = as.integer((last_page[, 2]))
  }
  return(as.integer(totalPages))
}


dateInActiveDays <- function(target_day, dates) {
  # Checks if a given day is in a vector of dates.
  #
  # Args:
  #   target_day: date to check
  #   dates: vector of dates to check
  #
  # Returns:
  #   TRUE if target_day is in dates, otherwise FALSE.
  
  for (day in dates) {
    if (target_day == day) {
      return(TRUE)
    }
  }
  return(FALSE)
}


getAllContributors <- function(url) {
  # Gets a list of all contributors to a project.
  #
  # Args:
  #   url: The project's github URL
  #
  # Returns:
  #   A dataframe containing all the contributors for that project.
  
  contributors <- list()
  info <- GET(paste(url, "/contributors?page=1", sep = ''), authentication)
  pages <- getTotalPages(info$headers$link)
  for (i in seq(1:pages)) {
    resp <- GET(paste(url, "/contributors?page=", i, sep = ''), authentication)
    currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
    contributors[[i]] <- currentPage
  }
  contributors <- rbind_pages(contributors)
  contributors
}

<<<<<<< HEAD
=======

>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
getAllCommits <- function(url) {
  # Gets a list of all commits to a project.
  #
  # Args:
  #   url: The project's github URL
  #
  # Returns:
  #   A dataframe containing all the commits for that project.
  
  commits <- list()
  info <-GET(paste(url, "/commits?page=1", sep = ''), authentication)
  pages <- getTotalPages(info$headers$link)
  for (i in seq(1:pages)) {
    resp <- GET(paste(url, "/commits?page=", i, sep = ''), authentication)
    currentPage <- fromJSON(content(resp, "text"), flatten = TRUE)
    commits[[i]] <- currentPage
  }
  commits <- rbind_pages(commits)
  commits <- commits[order(as.Date(commits$commit.committer.date)), ]
  commits
}

<<<<<<< HEAD
getActiveContributors <- function(url) {
=======

getActiveContributors <- function(commits) {
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
  # Gets a list of all active/inactive contributors every 30 active days for a project.
  #
  # Args:
  #   url: The project's github URL
  #
  # Returns:
  #   A list of active/inactive users every 30 active days.
  
  active <- list()
<<<<<<< HEAD
  commits <- getAllCommits(url)
=======
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
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
  print(active)
  active
}

<<<<<<< HEAD
=======

>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
simEffort <- function(url) {
  # Simulates effort of given GitHUb repository based on active and inactive
  # contributors.
  #
  # Args:
  #   url: the repo's github api url to simulate
  #
  # Returns:
  #   Effort in person-hours
  
<<<<<<< HEAD
  activeContributors <- getActiveContributors(url)
=======
  commits <- getAllCommits(url)
  activeContributors <- getActiveContributors(commits)
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
  effort <- 0
  if(length(activeContributors)>0){
    for (i in 1:length(activeContributors)) {
      effort <- effort + (length(activeContributors[[i]]$active)*152) + (length(activeContributors[[i]]$inactive)*51)
    }
  }
  
  list(effort = effort, active_personnel = length(activeContributors), commits = nrow(commits))
}


input_data = read.xlsx(input_filename, colNames=TRUE) # import datasheet as DataFrame
for(i in 1:nrow(input_data)) {
  active_personnel = c()
  gitUrl = convertToAPI(input_data[i, 2])
  outputFile = paste(input_data[i, 1], ".txt", sep="")
  sink(outputFile)
  
  effortResult <- simEffort(gitUrl)
  
  print("effort")
  print(effortResult$effort)
  print("active personnel")
  print(effortResult$active_personnel)
<<<<<<< HEAD
  active_personnel = c(active_personnel,effortResult$active_personnel)
  sink()
}
=======
  print("commits")
  print(effortResult$commits)
  active_personnel = c(active_personnel,effortResult$active_personnel)
  sink()
}
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
