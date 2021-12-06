const axios = require('axios');
const oauth = require('axios-oauth-client');
const tokenProvider = require('axios-token-interceptor');

const secrets = require('./secrets');

console.log(`Setting up API client @ ${secrets.everactive_baseurl}`);

axios.defaults.baseURL = secrets.everactive_baseurl;

// oauth helper method to retrieve client_credentials grant_type
// access_token.
const getClientCredentials = oauth.client(axios.create(), {
  url: `/auth/token`,
  grant_type: 'client_credentials',
  client_id: secrets.everactive_client_id,
  client_secret: secrets.everactive_client_secret
});

(async function main() {

  console.log("Hello Everactive API");

  // Prepare the REST Client.
  const apiClient = axios.create({
    baseURL: secrets.everactive_baseurl,
  });

  // Interceptor to retrieve an access token and cache until the token
  // expires. When the token expires a new request will be made using the
  // getClientCredentials method to get a new token.
  apiClient.interceptors.request.use(
    oauth.interceptor(tokenProvider, getClientCredentials)
  );

  // Contact the API Endpoints as specified in https://api-spec.data.everactive.com/

  console.log("Get a list of machines from /machines");
  const machineListResponse = await apiClient.get('/machines');
  console.log(`${machineListResponse.status} - ${machineListResponse.statusText}`);
  if (machineListResponse.status != 200) {
    console.error("Request Failed");
    process.exit(1);
  }
  console.log("PaginationInfo:", machineListResponse.data.paginationInfo);
  console.log("ListSummary:", machineListResponse.data.listSummary);

  // details
  if (machineListResponse.data.data.length > 0) {
    console.log("First Machine");
    const firstMachine = machineListResponse.data.data[0]
    console.log(firstMachine);
    console.log('\n\n');

    //machine time series data
    console.log(`Time series data for machine id ${firstMachine.id}`);
    const lastReadingUnixTimestamp = firstMachine.sensor?.lastReading?.timestamp;
    if (lastReadingUnixTimestamp) {
      // Retrieve up to 8 hours of data prior to the last reading timestamp
      const startUnixTimestap = lastReadingUnixTimestamp - (8 * 60 * 60);
      const machineId = firstMachine.id
      const timeseriesResponse = await apiClient.get(`/machines/${machineId}/timeseries?startTime=${startUnixTimestap}&endTime=${lastReadingUnixTimestamp}`);
      console.log(`${timeseriesResponse.status} - ${timeseriesResponse.statusText}`);
      if (timeseriesResponse.status != 200) {
        console.error("Request Failed");
        process.exit(1);
      }
      console.log("result set info", timeseriesResponse.data.resultSetInfo);
      if (timeseriesResponse.data.resultSetInfo.returnedItemCount > 0) {
        console.log("First 3 readings");
        for (let i = 0; i < 3; i++) {
          console.log(timeseriesResponse.data.data[i]);
        }
      }
    } else {
      console.log(`no sensor data for machineId ${machineId}`);
    }
  }
})();