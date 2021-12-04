# nodejs-api-client-sample
Sample nodejs application that interacts with the Everactive API.

## Configuration

in order to run this example you need to create a `secrets.js` file with your API credentials:

```
module.exports = {
  "everactive_baseurl": "https://api.data.everactive.com/v2020-07",
  "everactive_client_id": "***********",
  "everactive_client_secret": "*******************"
}
```

You can rename the `secrets_example.js` file to `secrets.js` and replace the values inside with your credentials.

## Running the application

This application is based on the Axios Http client (https://www.npmjs.com/package/axios). To install the dependencies run

```
npm install
```

To execute the MHM example

```
npm run mhm-client
```

## Runing with Docker

In case you don't want to use a local nodejs engin, we have included a Dockerfile that will allow you to run the application inside a container.

Build the image:
```
docker build -t everactive-api .
```

Run the application:
```
docker run -ti --rm everactive-api npm run mhm-client
```

