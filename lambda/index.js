'use strict'
const axios = require('axios')
const oauth = require('axios-oauth-client')
const tokenProvider = require('axios-token-interceptor')

exports.handler = async (event, content, callback) => {
  axios.defaults.baseURL = process.env.BASE_URL

  try {
    const getClientCredentials = oauth.client(axios.create(), {
      url: '/auth/token',
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    })

    const apiClient = axios.create()

    apiClient.interceptors.request.use(
      oauth.interceptor(tokenProvider, getClientCredentials)
    )

    const machinesRes = await apiClient.get('/machines')

    if (machinesRes.status !== 200) {
      callback(Error(`Request Failed: ${machinesRes.status}`))
      return
    }

    const machines = machinesRes.data?.data || []
    if (machines.length === 0) {
      callback(null)
      return
    }

    const endTime = machines[0].sensor?.lastReading?.timestamp || 0
    const startTime = endTime - 8 * 3600
    if (!endTime || startTime < 0) {
      callback(null)
      return
    }

    const timeseriesList = await Promise.all(machines.map(async machine => {
      const res = await apiClient.get(`/machines/${machine.id}/timeseries?startTime=${startTime}&endTime=${endTime}`);
      if (res.status != 200) {
        return { id: machine.id, error: `status: ${res.status}` }
      }
      return { id: machine.id, resultSetInfo: res.data?.resultSetInfo, data: res.data?.data }
    }))

    callback(null, timeseriesList)
  } catch (err) {
    callback(err)
  }
}
