# The details of the data preparation depend very much on the specific data set,
# the coding of each variable, and what variables and cases one would like to select
# before making the data available through the Teaching Charts web interface.
#
# This file provides a crude template for preparing the data using R, so simplify
# the process.
#
# This code assumes there is a data frame called 'data' in the R environment, which
# contains all the data and observations to be included, with everything else already
# removed. It also assumes there is a named character vector 'varLabels' in the R environment,
# which provides variable labels for some or all of the variables in 'data'.
#
# Note that frontend/public/data/test_data.json provides a good example of the kind of
# data file that this code produces.

library(rjson)

data_output <- list()

for (var in names(data)) {
  
  values <- data[,  var]

  # Where missing data is encountered in the data, a simple approach implemented here
  # is to replace missing values by random sampling from the non-missing values.
  values[is.na(values)] <- sample(values[!is.na(values)], 
    sum(is.na(values)), replace = TRUE)
  
  data_output[[var]]$label <- if (var %in% names(varLabels)) unname(varLabels[var]) else var
  
  # If the variable is a factor, convert it to integer codes and store the labels
  # separately.
  if (is.factor(values)) {
    labels <- levels(values)
    values <- as.integer(factor(values,  levels = labels))
    names(labels) <- 1:length(labels)
    data_output[[var]]$labels <- labels
  }
  
  data_output[[var]]$values <- values
}

cat(toJSON(data_output, indent = 2), file = "data.json")