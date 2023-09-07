const axios = require("axios");
const { POSTMAN_API_BASE_URL } = require("./constants");
const { getAxiosConfig } = require("./axiosUtils");

const createRequest = async (postmanApiKey, collectionId, requestContents) => {
  const url = `${POSTMAN_API_BASE_URL}/collections/${collectionId}/requests`;
  const response = await axios.post(
    url,
    requestContents,
    getAxiosConfig(postmanApiKey),
  );
  return response.data.model_id;
};

const createResponse = async (
  postmanApiKey,
  collectionId,
  requestId,
  responseContents,
) => {
  const url = `${POSTMAN_API_BASE_URL}/collections/${collectionId}/responses?request=${requestId}`;
  const response = await axios.post(
    url,
    responseContents,
    getAxiosConfig(postmanApiKey),
  );
  return response.data.model_id;
};

module.exports = {
  createRequest,
  createResponse,
};
