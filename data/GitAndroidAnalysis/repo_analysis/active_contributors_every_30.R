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
  print(linkHeaderStr)
  if(is.null(linkHeaderStr)){
    1
  }
  else{
  matched <-
    stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
  as.integer(matched[, 2])
  }
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
  
  #url = gitUrl
  #url = "https://api.github.com/repos/apache/carbondata"
  #user = "flyqk"
  #pw = "qk@github/910304"
  
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
  print(active)
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
  if(length(activeContributors)>0){
  for (i in 1:length(activeContributors)) {
    effort <- effort + (length(activeContributors[[i]]$active)*152) + (length(activeContributors[[i]]$inactive)*51)
  }
  }
  
  list(effort = effort, active_personnel = length(activeContributors))
}


gitUrls <- c(
  "https://api.github.com/repos/dkim0419/SoundRecorder",
  "https://api.github.com/repos/javiersantos/MLManager",
  "https://api.github.com/repos/afollestad/photo-affix",
  "https://api.github.com/repos/esoxjem/MovieGuide",
  "https://api.github.com/repos/avjinder/Minimal-Todo",
  "https://api.github.com/repos/AntonioRedondo/AnotherMonitor",
  "https://api.github.com/repos/frogermcs/InstaMaterial",
  "https://api.github.com/repos/federicoiosue/Omni-Notes",
  "https://api.github.com/repos/heruoxin/Clip-Stack",
  "https://api.github.com/repos/AntennaPod/AntennaPod",
  "https://api.github.com/repos/ivacf/archi",
  "https://api.github.com/repos/bitcoin-wallet/bitcoin-wallet",
  "https://api.github.com/repos/google/ExoPlayer",
  "https://api.github.com/repos/codinguser/gnucash-android",
  "https://api.github.com/repos/google/iosched",
  "https://api.github.com/repos/k9mail/k-9",
  "https://api.github.com/repos/byoutline/kickmaterial",
  "https://api.github.com/repos/TeamNewPipe/NewPipe",
  "https://api.github.com/repos/j4velin/Pedometer",
  "https://api.github.com/repos/kabouzeid/Phonograph",
  "https://api.github.com/repos/watabou/pixel-dungeon",
  "https://api.github.com/repos/nickbutcher/plaid",
  "https://api.github.com/repos/moezbhatti/qksms",
  "https://api.github.com/repos/timusus/Shuttle",
  "https://api.github.com/repos/JakeWharton/Telecine",
  "https://api.github.com/repos/vmihalachi/turbo-editor",
  "https://api.github.com/repos/videolan/vlc",
  "https://api.github.com/repos/Musenkishi/wally",
  "https://api.github.com/repos/wordpress-mobile/WordPress-Android",
  "https://api.github.com/repos/joyoyao/superCleanMaster",
  "https://api.github.com/repos/kickstarter/android-oss",
  "https://api.github.com/repos/k0shk0sh/FastHub",
  "https://api.github.com/repos/hidroh/materialistic",
  "https://api.github.com/repos/owncloud/android",
  "https://api.github.com/repos/google/santa-tracker-android",
  "https://api.github.com/repos/uberspot/2048-android",
  "https://api.github.com/repos/DrKLO/Telegram",
  "https://api.github.com/repos/signalapp/Signal-Android",
  "https://api.github.com/repos/MindorksOpenSource/android-mvp-architecture",
  "https://api.github.com/repos/shadowsocks/shadowsocks-android",
  "https://api.github.com/repos/wikimedia/apps-android-wikipedia",
  "https://api.github.com/repos/xcc3641/SeeWeather",
  "https://api.github.com/repos/todoroo/astrid",
  "https://api.github.com/repos/pockethub/PocketHub",
  "https://api.github.com/repos/todotxt/todo.txt-android",
  "https://api.github.com/repos/prey/prey-android-client",
  "https://api.github.com/repos/iFixit/iFixitAndroid",
  "https://api.github.com/repos/manmal/hn-android",
  "https://api.github.com/repos/gaugesapp/gauges-android",
  "https://api.github.com/repos/cgeo/cgeo",
  "https://api.github.com/repos/talklittle/reddit-is-fun",
  "https://api.github.com/repos/TeamAmaze/AmazeFileManager",
  "https://api.github.com/repos/HoraApps/LeafPic",
  "https://api.github.com/repos/SimpleMobileTools/Simple-Calendar",
  "https://api.github.com/repos/1hakr/AnExplorer",
  "https://api.github.com/repos/naman14/Timber",
  "https://api.github.com/repos/Nightonke/CoCoin",
  "https://api.github.com/repos/project-travel-mate/Travel-Mate",
  "https://api.github.com/repos/Neamar/KISS",
  "https://api.github.com/repos/android10/Android-CleanArchitecture",
  "https://api.github.com/repos/duckduckgo/Android",
  "https://api.github.com/repos/osmandapp/Osmand",
  "https://api.github.com/repos/romannurik/muzei",
  "https://api.github.com/repos/romannurik/dashclock",
  "https://api.github.com/repos/adrianchifor/Swiftnotes",
  "https://api.github.com/repos/MirakelX/mirakel-android",
  "https://api.github.com/repos/PaulWoitaschek/Voice",
  "https://api.github.com/repos/amaceh/kindle-app"
            )

outputFiles <- c(
  "EasySoundRecorder.txt",
  "MLManager.txt",
  "PhotoAffix.txt",
  "MovieGuide.txt",
  "MinimalToDo.txt",
  "AnotherMonitor.txt",
  "InstaMaterial.txt",
  "OmniNotes.txt",
  "ClipStack.txt",
  "AntennaPod.txt",
  "archi.txt",
  "bitcoin-wallet.txt",
  "ExoPlayer.txt",
  "gnucash-android.txt",
  "iosched.txt",
  "k-9.txt",
  "kickmaterial.txt",
  "NewPipe.txt",
  "Pedometer.txt",
  "Phonograph.txt",
  "pixel-dungeon.txt",
  "plaid.txt",
  "qksms.txt",
  "Shuttle.txt",
  "Telecine.txt",
  "turbo-editor.txt",
  "vlc.txt",
  "wally.txt",
  "WordPress-Android.txt",
  "superCleanMaster.txt",
  "kickstarter.txt",
  "FastHub.txt",
  "materialistic.txt",
  "owncloud.txt",
  "santa-tracker.txt",
  "2048.txt",
  "Telegram.txt",
  "Signal.txt",
  "Mindorks.txt",
  "shadowsocks.txt",
  "wikimedia.txt",
  "SeeWeather.txt",
  "astrid.txt",
  "PocketHub.txt",
  "todotxt.txt",
  "prey.txt",
  "iFixit.txt",
  "manmal.txt",
  "gauges.txt",
  "cgeo.txt",
  "reddit.txt",
  "AmazeFileManager.txt",
  "LeafPic.txt",
  "SimpleCalendar.txt",
  "AnExplorer.txt",
  "Timber.txt",
  "CoCoin.txt",
  "TravelMate.txt",
  "KISS.txt",
  "Android-CleanArchitecture.txt",
  "DuckDuckGo.txt",
  "Osmand.txt",
  "muzei.txt",
  "dashclock.txt",
  "Swiftnotes.txt",
  "mirakel-android.txt",
  "MaterialAudiobookPlayer.txt",
  "Kindle.txt"
  )

active_personnel = c()
for(i in 64:64){
gitUrl = gitUrls[i]
outputFile = outputFiles[i]
sink(outputFile)

#effortResult <- simEffort("https://api.github.com/repos/apache/carbondata", "flyqk", "qk@github/910304")

effortResult <- simEffort(gitUrl, "flyqk", "qk@github/910304")

print("effort")
print(effortResult$effort)
print("active personnel")
print(effortResult$active_personnel)
active_personnel = c(active_personnel,effortResult$active_personnel)
sink()
}
