const { before, after } = require("lodash");
const CurlOutputParser = require("./CurlOuputParser").CurlOuputParser;

const curlOutput = `*   Trying 52.21.146.215:443...
* Connected to postman-echo.com (52.21.146.215) port 443 (#0)
* ALPN: offers h2,http/1.1
* (304) (OUT), TLS handshake, Client hello (1):
} [321 bytes data]
*  CAfile: /etc/ssl/cert.pem
*  CApath: none
* (304) (IN), TLS handshake, Server hello (2):
{ [100 bytes data]
* TLSv1.2 (IN), TLS handshake, Certificate (11):
{ [4968 bytes data]
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
{ [333 bytes data]
* TLSv1.2 (IN), TLS handshake, Server finished (14):
{ [4 bytes data]
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
} [70 bytes data]
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
} [1 bytes data]
* TLSv1.2 (OUT), TLS handshake, Finished (20):
} [16 bytes data]
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
{ [1 bytes data]
* TLSv1.2 (IN), TLS handshake, Finished (20):
{ [16 bytes data]
* SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=postman-echo.com
*  start date: Jun 14 00:00:00 2023 GMT
*  expire date: Jul 12 23:59:59 2024 GMT
*  subjectAltName: host "postman-echo.com" matched cert's "postman-echo.com"
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M02
*  SSL certificate verify ok.
* using HTTP/2
* h2h3 [:method: POST]
* h2h3 [:path: /post]
* h2h3 [:scheme: https]
* h2h3 [:authority: postman-echo.com]
* h2h3 [user-agent: curl/7.88.1]
* h2h3 [accept: */*]
* h2h3 [content-type: application/json]
* h2h3 [content-length: 22]
* Using Stream ID: 1 (easy handle 0x7f82e9010a00)
> POST /post HTTP/2
> Host: postman-echo.com
> user-agent: curl/7.88.1
> accept: */*
> content-type: application/json
> content-length: 22
> 
} [22 bytes data]
* We are completely uploaded and fine
< HTTP/2 200 
< date: Wed, 06 Sep 2023 10:24:04 GMT
< content-type: application/json; charset=utf-8
< content-length: 468
< etag: W/"1d4-avON6UBMJVd0TGIJh/BTvuK/4M4"
< set-cookie: sails.sid=s%3AtJZudB_4xJv_In5EygauD85pLsxs8OEg.DTvHZGFPgUJRgv6mynPwcYSIAqui6zh%2FXORqNw2%2F3sA; Path=/; HttpOnly
< 
{ [467 bytes data]
* Connection #0 to host postman-echo.com left intact
{
  "args": {},
  "data": {
    "field": "Value"
  },
  "files": {},
  "form": {},
  "headers": {
    "x-forwarded-proto": "https",
    "x-forwarded-port": "443",
    "host": "postman-echo.com",
    "x-amzn-trace-id": "Root=1-64f85344-6c056d1c756e6460557e8299",
    "content-length": "22",
    "user-agent": "curl/7.88.1",
    "accept": "*/*",
    "content-type": "application/json"
  },
  "json": {
    "field": "Value"
  },
  "url": "https://postman-echo.com/post"
}
`;

describe("CurlOutputParser", () => {
  beforeEach(() => {
    parser = new CurlOutputParser(curlOutput);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("getURL", () => {
    parser.parse();
    expect(parser.getURL()).toBe("https://postman-echo.com/post");
  });
  test("parseRequestUrlField", () => {
    parser.parseRequestUrlField("* h2h3 [:path: /post]");
    expect(parser.path).toBe("/post");
    parser.parseRequestUrlField("* h2h3 [:scheme: https]");
    expect(parser.scheme).toBe("https");
    parser.parseRequestUrlField("* h2h3 [:authority: postman-echo.com]");
    expect(parser.authority).toBe("postman-echo.com");
  });
  test("parseRequestHeader", () => {
    parser.parseRequestHeader("> Host: postman-echo.com");
    parser.parseRequestHeader("> POST /post HTTP/2");
    expect(parser.requestHeaders).toStrictEqual([
      { key: "Host", value: "postman-echo.com" },
    ]);
  });
  test("parseResponseHeader", () => {
    parser.parseResponseHeader("< date: Wed, 06 Sep 2023 10:24:04 GMT");
    parser.parseResponseHeader("< HTTP/2 200");
    expect(parser.responseHeaders).toStrictEqual([
      { key: "date", value: "Wed, 06 Sep 2023 10:24:04 GMT" },
    ]);
  });
  test("parseResponseStatusCode", () => {
    parser.parseResponseStatusCode("< HTTP/2 200");
    expect(parser.responseStatusCode).toBe(200);
  });
  test("parse", () => {
    parser.parse();
    expect(parser.scheme).toBe("https");
    expect(parser.authority).toBe("postman-echo.com");
    expect(parser.path).toBe("/post");
    expect(parser.requestHeaders).toStrictEqual([
      { key: "Host", value: "postman-echo.com" },
      { key: "user-agent", value: "curl/7.88.1" },
      { key: "accept", value: "*/*" },
      { key: "content-type", value: "application/json" },
      { key: "content-length", value: "22" },
    ]);
    expect(parser.responseHeaders).toStrictEqual([
      { key: "date", value: "Wed, 06 Sep 2023 10:24:04 GMT" },
      { key: "content-type", value: "application/json; charset=utf-8" },
      { key: "content-length", value: "468" },
      { key: "etag", value: 'W/"1d4-avON6UBMJVd0TGIJh/BTvuK/4M4"' },
      {
        key: "set-cookie",
        value:
          "sails.sid=s%3AtJZudB_4xJv_In5EygauD85pLsxs8OEg.DTvHZGFPgUJRgv6mynPwcYSIAqui6zh%2FXORqNw2%2F3sA; Path=/; HttpOnly",
      },
    ]);
    expect(parser.responseStatusCode).toBe(200);
    expect(JSON.parse(parser.responseBody)).toStrictEqual({
      args: {},
      data: {
        field: "Value",
      },
      files: {},
      form: {},
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-port": "443",
        host: "postman-echo.com",
        "x-amzn-trace-id": "Root=1-64f85344-6c056d1c756e6460557e8299",
        "content-length": "22",
        "user-agent": "curl/7.88.1",
        accept: "*/*",
        "content-type": "application/json",
      },
      json: {
        field: "Value",
      },
      url: "https://postman-echo.com/post",
    });
  });
  test("toPostmanRequest", () => {
    parser.parse();
    expect(parser.toPostmanRequest("name")).toStrictEqual({
      name: "name",
      description: "",
      url: parser.getURL(),
      method: parser.method,
      headers: parser.requestHeaders,
      dataMode: "raw",
      rawModeData: null,
      dataOptions: {
        raw: {
          language: "json",
        },
      },
    });
  });
  test("toPostmanResponse", () => {
    parser.parse();
    expect(parser.toPostmanResponse("name")).toStrictEqual({
      name: "name",
      responseCode: {
        code: parser.responseStatusCode,
        name: "OK",
      },
      headers: parser.responseHeaders,
      text: parser.responseBody,
      language: "json",
      requestObject: expect.any(String),
    });
  });
});
