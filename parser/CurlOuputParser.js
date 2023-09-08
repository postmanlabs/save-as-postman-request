const HttpStatus = require("http-status-codes");
const { trimEnd, toSafeInteger } = require("lodash");

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParseError";
  }
}

class CurlOuputParser {
  constructor(curlOutput) {
    this.curlOutput = curlOutput;
    this.method = null;
    this.path = null;
    this.scheme = null;
    this.authority = null;
    this.requestHeaders = [];
    this.requestBody = process.env.REQUEST_BODY || null;
    this.responseStatusCode = 200;
    this.responseHeaders = [];
    this.responseBody = "";
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }

  getURL() {
    return `${this.scheme}://${this.authority}${this.path}`;
  }

  parseRequestUrlField(line) {
    const match = line.match(/\* h2h3 \[:(?<field>.*): (?<value>.*)\]/i);
    if (match) {
      this[match.groups.field] = match.groups.value;
    }
  }

  parseRequestHeader(line) {
    const match = line.match(/> (?<field>.*): (?<value>.*)/i);
    if (match) {
      this.requestHeaders.push({
        key: match.groups.field,
        value: match.groups.value,
      });
    }
  }

  parseResponseHeader(line) {
    const match = line.match(/< (?<field>.*): (?<value>.*)/i);
    if (match) {
      this.responseHeaders.push({
        key: match.groups.field,
        value: match.groups.value,
      });
    }
  }

  parseResponseStatusCode(line) {
    const match = line.match(/< HTTP\/2 (?<statusCode>\d+)/i);
    if (match) {
      this.responseStatusCode = toSafeInteger(match.groups.statusCode);
    }
  }

  parse() {
    const lines = this.curlOutput.split("\n");
    let isFirstOutputLine = true;
    let isLastOutputLine = false;
    lines.forEach((line) => {
      const isLogLine = line.match(/^\s*\d+ .+/i);
      if (line && !isLogLine) {
        if (line.startsWith("* h2h3 [:")) {
          this.parseRequestUrlField(line);
        } else if (line.startsWith(">")) {
          this.parseRequestHeader(line);
        } else if (line.startsWith("<")) {
          if (isFirstOutputLine) {
            this.parseResponseStatusCode(line);
            isFirstOutputLine = false;
          } else {
            if (line.trim() === "<") {
              isLastOutputLine = true;
            } else {
              this.parseResponseHeader(line);
            }
          }
        } else {
          if (isLastOutputLine) {
            if (!line.startsWith("*") && !line.startsWith("{ [")) {
              this.responseBody += trimEnd(line, "%") + "\n";
            }
          }
        }
      }
    });
    if (!this.isValid()) {
      throw new ParseError("Invalid curl output");
    }
  }

  isValid() {
    return (
      this.scheme && this.authority && this.path && this.responseStatusCode
    );
  }

  getRequestBody() {
    if (
      this.method &&
      (this.method.toUpperCase() === "POST" ||
        this.method.toUpperCase() === "PUT")
    ) {
      return this.requestBody;
    }
    return null;
  }

  toPostmanResponse(responseName) {
    return {
      name: responseName,
      responseCode: {
        code: this.responseStatusCode,
        name: HttpStatus.getReasonPhrase(this.responseStatusCode),
      },
      headers: this.responseHeaders,
      text: this.responseBody,
      language: "json",
      requestObject: JSON.stringify(this.toPostmanRequest("Request"), null, 2),
    };
  }

  toPostmanRequest(requestName) {
    return {
      name: requestName,
      description: "",
      url: this.getURL(),
      method: this.method,
      headers: this.requestHeaders,
      dataMode: "raw",
      rawModeData: this.getRequestBody(),
      dataOptions: {
        raw: {
          language: "json",
        },
      },
    };
  }
}

module.exports = {
  CurlOuputParser,
  ParseError,
};
