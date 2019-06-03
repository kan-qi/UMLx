# This script takes in a .xlsx file with a specific format (see repos.xlsx for reference),
# and finds a list of emails of contributors for each project in the input.
# 
# To run this script, make sure to have the following libraries installed, and have the
# input file "repos.xlsx" in your work directory (you can also change the filename below).
# Simply highlight all lines and click run.


# import libraries
library(httr)
library(jsonlite)
library(openxlsx)
library(stringr)


# Variables
input_filename = "repos.xlsx"
output_filename = "emails.xlsx"
MAX_NUM_EMAILS = 200 # set a maximum number of emails to retrieve for each project

# set user-agent
agent_user = "flyqk"
agent_password = "qk@github/910304"
authentication = authenticate(agent_user, agent_password)


getTotalPages <- function(info) {
  # Finds the last page from the API GET request.
  #
  # Args:
  #   info: content from API GET request -> http response object
  #
  # Returns:
  #   The last page number; the number of pages in the request -> integer
  
  linkHeaderStr = info$headers$link
  totalPages = 1
  if (!is.null(linkHeaderStr)) {
    last_page <- stringr::str_match(linkHeaderStr, "page=(\\d+)>; rel=\\\"last\\\"")
    totalPages = as.integer((last_page[, 2]))
  }
  return(as.integer(totalPages))
}


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


getEmail <- function(user_name, user_info) {
  # Gets user's e-mail from user's recent event API page.
  #
  # Args:
  #   user_name: user's Github name -> characters
  #   user_info: GET request from user's recent event page -> http response object
  #
  # Returns:
  #   Retrieved email -> characters/NA
  
  user_info_json = content(user_info, as="parsed")
  len = length(user_info_json)
  if (len > 0) {
    for (i in 1:len) {
      # check if payload and commit tags exist
      commits = user_info_json[[i]]$payload$commits
      if (!is.null(commits) && length(commits)) {
        user_email = commits[[1]]$author$email
        
        # check if this email belongs to the user
        if (!is.null(user_email) && user_name == user_info_json[[i]]$actor$login) {
          return(user_email)
        }
      }
    }
  }
  return(NA)
}


getContributors <- function(repo_name, repo_url) {
  # Gets all contributors of the repository
  #
  # Args:
  #   user_name: user's Github name -> characters
  #   user_info: GET request from user's recent event page -> http response object
  #
  # Returns:
  #   Retrieved email -> characters/NA
  
  print(paste("## ", repo_name, " ##"))
  contributors <- list()
  
  # find contriutor list by retrieving info from the contributor page
  api_url = convertToAPI(repo_url)
  contrib_page = paste(api_url, "/contributors?page=1", sep='')
  info <- GET(contrib_page, authentication)
  totalPages <- getTotalPages(info)
  
  # convert JSON to DataFrame
  currentPage <- fromJSON(content(info, "text"), flatten=TRUE)
  contributors[[1]] <- currentPage
  
  if (totalPages > 1) {
    print(paste("Found", totalPages, "pages."))
    
    for (page in 2:totalPages) {
      contrib_page = paste(api_url, "/contributors?page=", page, sep='')
      info <- GET(contrib_page, authentication)
      currentPage <- fromJSON(content(info, "text"), flatten=TRUE)
      contributors[[page]] <- currentPage
    }
  } else {
    print(paste("Only 1 page was found."))
  }
  all_contributors = do.call("rbind", contributors) # combine all DataFrame into one
  all_contributors$repo_name <- repo_name
  return(all_contributors)
}


getEmails <- function(contributors) {
  # Retrieve emails of each contributor.
  #
  # Args:
  #   contributors: all contributors of the repo -> DataFrame
  #
  # Returns:
  #   all contributors with their emails and contributions -> DataFrame
  
  email_table <- data.frame(name=c(), email=c(), contributions = c(), repo_name=c())
  counter = 0
  for (user in 1:nrow(contributors)) {
    user_name = contributors[user, 1]
    user_url = paste("https://api.github.com/users", user_name, "events/public", sep="/")
    print(paste("Fetching user", user_name, "email from:", user_url))
    
    user_info <- GET(user_url, authentication)
    user_email = getEmail(user_name, user_info)
    
    if (!is.na(user_email)) {
      counter = counter + 1
      email <- data.frame(name = user_name, email = user_email,
                          contributions = contributors[["contributions"]][user],
                          repo_name = contributors[["repo_name"]][user])
      email_table <- rbind(email_table, email)
      print("Added new row:")
      print(email)
      if (counter == MAX_NUM_EMAILS) {
        break
      }
    }
    else {
      print("Cannot find email.")
    }
  }
  
  print(paste("Retrieved", counter, "out of", nrow(contributors), "emails."))
  return(email_table)
}


run <- function(input_filename, output_filename) {
  # Retrieve emails from contributors of each project in the input file and output the results.
  #
  # Args:
  #   input_filename: name of the input xlsx file -> characters
  #   output_filename: name of the output xlsx file -> characters
  
  input_data = read.xlsx(input_filename, colNames=TRUE) # import datasheet as DataFrame
  output <- data.frame() # output DataFrame
  
  for (project in 1:nrow(input_data)) {
    contributors <- getContributors(input_data[project, 1], input_data[project, 2])
    output <- rbind(output, getEmails(contributors)) # append result to the output DataFrame
  }
  
  # output to xlsx file
  write.xlsx(output, output_filename)
  print(paste("Finished running. Output has been stored in the", output_filename, "file."))
}


run(input_filename, output_filename)
