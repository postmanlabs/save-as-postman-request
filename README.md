# save-as-postman-request

> This code is part of a blog post and is **not** actively maintained by Postman.

Command line utility to process piped curl responses and create postman a request on a collection using the Postman API

## Purpose

This code demonstrates how to use the [Postman API](https://www.postman.com/postman/workspace/postman-public-workspace/collection/12959542-c8142d51-e97c-46b6-bd77-52bb66712c9a) to create requests and responses on a collection, given an specific [curl](https://curl.se/) command output.

The goal of this repository is to demonstrate how the Collection Items endpoints can be used to modify a Postman collection adding requests and responses programmatically, without having to perform a full PUT of the collection.

In order to do that, we have created a (small Postman API wrapper)[api/apiClient.js] that enables users to create collection requests and responses. We have also created a Javascript file called (savePostmanRequest.js)[savePostmanRequest.js] that can be executed as a shell script.

> NOTE: You need a valid (Postman API key)[https://learning.postman.com/docs/developer/postman-api/authentication/] saved in an environment variable called `POSTMAN_API_KEY` in order to execute the command.

```shell
export POSTMAN_API_KEY=PMAK_your_key
```

## Usage

The (savePostmanRequest.js)[savePostmanRequest.js] command receives the following arguments:

```shell
./savePostmanRequest.js --inputFile <inputFilePath> --collectionId <collectionId> [--requestId <requestId>] [--requestName <requestName>] [--responseName <responseName>]
```

| Argument     | Description                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| inputFile    | the file that contains the output of a curl command, generated using the -v or --verbose option. Mandatory.                    |
| collectionId | the id of the collection to save the new request to. Mandatory.                                                                |
| requestId    | the id of the request to save the new example (response) to. If not provided, a new request will be created on the collection. |
| requestName  | the name of the new request to be created, by default is 'Request'.                                                            |
| responseName | the name of the new response to be created, by default is 'Response'.                                                          |

> NOTE: CURL doesn't provide information related to the request body. If you want to create a new request, make sure you set the REQUEST_BODY environment variable with the request body before calling this command.

# Example of a POST request

1. Save the request body in the `REQUEST_BODY` env variable.

```shell
export REQUEST_BODY=$(cat request_body_example.json)
```

2. Execute the `curl` command we want to save a response for, and save all the outputs to a file.

```shell
curl -v -X POST --location 'https://postman-echo.com/post' \
--header 'Content-Type: application/json' \
--data $REQUEST_BODY > curl_output.txt 2>&1
```

3. Process the file using the command, and create a request and response in a specified collection.

```shell
./savePostmanRequest.js --inputFile curl_output.txt  --collectionId 16473433-c05fb60e-bb28-4e7b-9cf7-55ada6ab320c --requestName 'Example from command line'
```

This is the output of the command:

```shell
➜  save-as-postman-request git:(main) ./savePostmanRequest.js --inputFile curl_output.txt  --collectionId 16473433-c05fb60e-bb28-4e7b-9cf7-55ada6ab320c --requestName 'Example from command line' --responseName='Post response'
Request created with id e057b34d-04b7-543f-c69a-069b48a6617a
Response created with id d2715ac5-b9b9-7e6f-e71d-e21040248939
```

# Example of GET request

1. Execute the `curl` command we want to save a response for, and save the output to a file.

```shell
curl -v -X GET --location 'https://postman-echo.com/get?param=value' \
--header 'Content-Type: application/json' > curl_output_get.txt 2>&1
```

2. Process the file using the command, and create a request and response in a specified collection.

```shell
./savePostmanRequest.js --inputFile curl_output_get.txt  --collectionId 16473433-c05fb60e-bb28-4e7b-9cf7-55ada6ab320c --requestName 'Example from command line get' --responseName='Get response'
```

This is the output of the command:

```shell
Request created with id 40310d86-2c98-f1a5-2b89-37506ed8f489
Response created with id c8d4066a-b736-a001-73fd-ad8d72ed76e9
```

# Adding a new response (example) to an existing request

You can also add new examples to an existing request, just passing the `--requestId` argument to the command. 

```shell
./savePostmanRequest.js --inputFile curl_output.txt  --collectionId 16473433-c05fb60e-bb28-4e7b-9cf7-55ada6ab320c --requestName 'Example from command line POST' --responseName='Another post response' --requestId=16473433-536730af-5663-15c7-0625-43c0d5b89030
```

The command response will include only the newly created response id:

```shell
Response created with id 973b0ed3-9d3d-9d72-8e1e-6b57d1524e1b
```
