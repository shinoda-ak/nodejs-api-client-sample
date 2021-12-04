const axios = require('axios');
const oauth = require('axios-oauth-client');

const secrets = require('./secrets');

console.log(`Setting up API client @ ${secrets.everactive_baseurl}`);
axios.defaults.baseURL = secrets.everactive_baseurl;

const getClientCredentials = oauth.client(axios.create(), {
  url: `/auth/token`,
  grant_type: 'client_credentials',
  client_id: secrets.everactive_client_id,
  client_secret: secrets.everactive_client_secret
});

(async function main() {

  console.log("Hello Everactive API");

  console.log("Get a token...")
  const authToken = await getClientCredentials();
  console.log(authToken);
  
  // prepare the REST Client with the fresh authorization token.
  const apiClient = axios.create({
    baseURL: secrets.everactive_baseurl,
    headers: { Authorization: `Bearer ${authToken.access_token}` }
  });

  // Contact the API Endpoints as specified in https://api-spec.data.everactive.com/
  
  console.log("Get a list of machines from /machines");
  const machineListResponse = await apiClient.get('/machines');
  console.log(`${machineListResponse.status} - ${machineListResponse.statusText}`);
  if(machineListResponse.status != 200) {
    console.error("Request Failed");
    process.exit(1);
  }
  console.log("PaginationInfo:", machineListResponse.data.paginationInfo);
  console.log("ListSummary:", machineListResponse.data.listSummary);
  
  // details
  if(machineListResponse.data.data.length > 0){
    console.log("First Machine");
    const firstMachine = machineListResponse.data.data[0]
    console.log(firstMachine);
    //machine time series data
    console.log(`Time series data for machine id ${firstMachine.id}`);
    //from 8 hours ago
    const currentStartTime = Math.floor(new Date().getTime() / 1000) - (8*60*60);
    const machineId = firstMachine.id
    const timeseriesResponse = await apiClient.get(`/machines/${machineId}/timeseries?startTime=${currentStartTime}`);
    console.log(`${timeseriesResponse.status} - ${timeseriesResponse.statusText}`);
    if(timeseriesResponse.status != 200) {
      console.error("Request Failed");
      process.exit(1);
    }
    console.log("result set info", timeseriesResponse.data.resultSetInfo);
    if(timeseriesResponse.data.resultSetInfo.returnedItemCount > 0){
      console.log("First 3 readings");
      for(let i=0; i<3; i++){
        console.log(timeseriesResponse.data.data[i]);
      }
    }
  }
})();