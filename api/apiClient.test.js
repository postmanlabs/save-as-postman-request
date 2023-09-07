const axios = require("axios");
const { getAxiosConfig } = require("./axiosUtils");
const { POSTMAN_API_BASE_URL } = require("./constants");
const apiClient = require("./apiClient");

jest.mock("axios");
jest.mock("./axiosUtils", () => {
  return {
    getAxiosConfig: jest.fn().mockReturnValue({}),
  };
});
const axiosPost = axios.post;

describe("test createRequest", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("calls the Postman API with the proper URL", async () => {
    const modelId = "MODEL_ID";
    axiosPost.mockResolvedValue({
      status: 200,
      data: { model_id: modelId },
    });
    const apiKey = "API_KEY";
    const collectionId = "COLLECTION_ID";
    const requestContents = "test";
    const result = await apiClient.createRequest(
      apiKey,
      collectionId,
      requestContents,
    );
    expect(result).toEqual(modelId);
    expect(getAxiosConfig).toHaveBeenCalledTimes(1);
    expect(getAxiosConfig).toHaveBeenCalledWith(apiKey);
    expect(axiosPost).toHaveBeenCalledTimes(1);
    expect(axiosPost).toHaveBeenCalledWith(
      `${POSTMAN_API_BASE_URL}/collections/${collectionId}/requests`,
      requestContents,
      {},
    );
  });
});

describe("test createResponse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("calls the Postman API with the proper URL", async () => {
    const modelId = "MODEL_ID";
    axiosPost.mockResolvedValue({
      status: 200,
      data: { model_id: modelId },
    });
    const apiKey = "API_KEY";
    const collectionId = "COLLECTION_ID";
    const requestId = "REQUEST_ID";
    const responseContents = "test";
    const result = await apiClient.createResponse(
      apiKey,
      collectionId,
      requestId,
      responseContents,
    );
    expect(result).toEqual(modelId);
    expect(getAxiosConfig).toHaveBeenCalledTimes(1);
    expect(getAxiosConfig).toHaveBeenCalledWith(apiKey);
    expect(axiosPost).toHaveBeenCalledTimes(1);
    expect(axiosPost).toHaveBeenCalledWith(
      `${POSTMAN_API_BASE_URL}/collections/${collectionId}/responses?request=${requestId}`,
      responseContents,
      {},
    );
  });
});
