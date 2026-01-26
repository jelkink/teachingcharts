# Teaching Charts

Using Javascript chart libraries to create a web interface for graphs, aimed at an undergraduate social science methodology module.

Builds on [React.js](https://react.dev) for the web interface, [Chart.js](https://www.chartjs.org) for the visualisations, and [Math.js](https://mathjs.org) for the statistical analyses. Installation can either use [Docker](https://www.docker.com) or by transferring static files to any web server.

## Preparing the code base

To get all third party libraries updated on the system, go to the frontend folder and execute:

````
npm install
````

## Docker installation

Go to the root folder and take the following steps:

For a development environment:

````
docker compose --profile dev build --no-cache
````

The above is only done once. After that, you can use the following to boot up the local server:

````
docker compose --profile dev up
````

For a production environment:

````
docker compose --profile prod build --no-cache
````

The above is only done once. After that, you can use the following to boot up the local server:

````
docker compose --profile prod up
````

Then you can open http://localhost:8080 in your browser.

## Remote installation

Go to the frontend folder and run:

````
npm run build
````

Then copy the files from the build folder that is created to the web server.

## Preparing a data set

The default implementation includes a very simple test data set and a small subset of the [2020 Irish National Election Survey](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/E6TAVY) (see also the [Irish Election Studies Archive](https://irishelectionstudies.org)). Most users will want to add their own data set. Please see the R-script in the utils for some basic guidance on preparing a data set for use in Teaching Charts. 

The resulting JSON file can then be added to the frontend/public/data folder. 

Line 5 in frontend/src/components/Form.js, which lists the available data sets, also needs to be updated to make the new data visible to the user.