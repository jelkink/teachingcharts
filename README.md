# Teaching Charts

Using JS chart libraries to create web interface for graphs in an undergraduate social science methodology module.

# Local installation

Go to the root folder and take the following steps:

For a development environment:

````
docker compose --profile dev up
````

For a production environment:

````
docker compose --profile prod up
````

Then you can open http://localhost:8080 in your browser.

# Remote installation

Go to the frontend folder and run:

````
npm run build
````

Then copy the files from the teachingcharts folder that is created to the web server.