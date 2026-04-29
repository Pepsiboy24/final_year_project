const axios = require('axios');
const axiosRetry = require('axios-retry').default;

const httpClient = axios.create();

axiosRetry(httpClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  }
});

httpClient.interceptors.request.use(config => {
    config.headers['x-internal-service'] = 'true';
    return config;
});

module.exports = httpClient;
