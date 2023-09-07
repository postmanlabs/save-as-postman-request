#!/usr/bin/env node

const fs = require("fs");
const { CurlOuputParser } = require("./parser/CurlOuputParser");
const { createRequest, createResponse } = require("./api/apiClient");

//get the api key from the environment variables
const apiKey = process.env.POSTMAN_API_KEY;
if (!apiKey) {
  console.error("Please set the POSTMAN_API_KEY environment variable");
  process.exit(1);
}

//get the collection id from the command line
const args = require("yargs").argv;
const inputFile = args.inputFile;
const collectionId = args.collectionId;
const requestId = args.requestId;
const requestName = args.requestName || "Request";
const responseName = args.responseName || "Response";

if (!inputFile || !collectionId) {
  console.error(
    "Usage: ./savePostmanRequest.js --inputFile <inputFilePath> --collectionId <collectionId> [--requestId <requestId>] [--requestName <requestName>] [--responseName <responseName>]",
  );
  console.error(
    "The curl command that generates the inputFile must be executed with the verbose option (-v) so we are able to retrieve request and response information.",
  );
  console.error(
    "inputFile: the file that contains the output of a curl command, generated using the -v or --verbose option.",
  );
  console.error(
    "collectionId: the id of the collection to save the new request to. Mandatory.",
  );
  console.error(
    "requestId: the id of the request to save the new example (response) to. If not provided, a new request will be created on the collection.",
  );
  console.error(
    "requestName: the name of the new request to be created, by default is 'Request'.",
  );
  console.error(
    "responseName: the name of the new response to be created, by default is 'Response'.",
  );
  console.error(
    "NOTE: CURL doesn't provide information related to the request body. If you want to create a new request, make sure you set the REQUEST_BODY environment variable with the request body before calling this command.",
  );
  process.exit(1);
}

let parser;
const mainProcess = async () => {
  const input = fs.readFileSync(inputFile, "utf8");
  parser = new CurlOuputParser(input);
  parser.parse();

  if (requestId) {
    const responseId = await createResponse(
      apiKey,
      collectionId,
      requestId,
      parser.toPostmanResponse(responseName),
    );
    console.log(`Response created with id ${responseId}`);
  } else {
    const newRequestId = await createRequest(
      apiKey,
      collectionId,
      parser.toPostmanRequest(requestName),
    );
    console.log(`Request created with id ${newRequestId}`);
    const responseId = await createResponse(
      apiKey,
      collectionId,
      newRequestId,
      parser.toPostmanResponse(responseName),
    );
    console.log(`Response created with id ${responseId}`);
  }
};

mainProcess().catch((error) => {
  console.error(error);
  console.log(`  scheme: ${parser.scheme}`);
  console.log(`  authority: ${parser.authority}`);
  console.log(`  path: ${parser.path}`);
  console.log(`  responseStatusCode: ${parser.responseStatusCode}`);
  process.exit(1);
});
