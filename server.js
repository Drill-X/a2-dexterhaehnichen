const http = require('http');
const fs = require('fs');
// IMPORTANT: you must run `npm install` in the directory for this assignment
// to install the mime library if you're testing this on your local machine.
// On Render, make sure `npm install` is your build command.
const mime = require('mime');
const dir = 'public/';
const port = 3010;

const password = "churros";

// helper class for the log of operations
class Operation {
  constructor(operator, value, acc) {
    this.operator = operator; //operator used for this operation
    this.value = value; //value used for this operation
    this.acc = acc; //the value of the accumulator after the operation was applied
  }
}

var accumulator = 0;
var operationLog = [new Operation("plus", 0, 0)];

const server = http.createServer(function (request, response) {
  if (request.method === 'GET') {
    handleGet(request, response)
  } else if (request.method === 'POST') {
    handlePost(request, response)
  }
})

const handleGet = function (request, response) {
  const filename = dir + request.url.slice(1)

  if (request.url === '/') {
    sendFile(response, 'public/index.html')
  } else if (request.url === "/data") {
    response.writeHead(200, "OK", { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(operationLog))
  } else if (request.url === "/admin") {
    if (request.headers.cookie != null && request.headers.cookie.split("=")[1] === password) {
      sendFile(response, "protected/admin.html")
    } else {
      response.writeHead(401, "Unauthorized")
      response.end("401 Unauthorized")
    }
  } else {
    sendFile(response, filename)
  }
}

const handlePost = function (request, response) {
  if (request.url === "/submit")
    handleOperationSubmit(request, response);
  else if (request.url === "/restore")
    handleRestoreHistory(request, response);
  else if (request.url === "/reset")
    handleDeleteHistory(request, response);
  else {
    response.writeHead(404)
    response.end('404 Error: Endpoint does not exist')
  }
}

const handleDeleteHistory = function (request, response) {
  if (!(request.headers.cookie != null && request.headers.cookie.split("=")[1] === password)) {
    response.writeHead(401, "Unauthorized")
    response.end("401 Unauthorized")
    return;
  }
  let dataString = '';

  request.on('data', function (data) {
    dataString += data;
  })

  request.on('end', function () {
    operationLog = [new Operation("plus", 0, 0)];
    accumulator = 0;
    response.writeHead(200, "OK", { 'Content-Type': 'text/plain' }).end();
  })
}

const handleRestoreHistory = function (request, response) {
  if (!(request.headers.cookie != null && request.headers.cookie.split("=")[1] === password)) {
    response.writeHead(401, "Unauthorized")
    response.end("401 Unauthorized")
    return;
  }
  let dataString = '';

  request.on('data', function (data) {
    dataString += data;
  })

  request.on('end', function () {
    let newHistory;
    try {
      newHistory = JSON.parse(dataString)
    } catch {
      sendValidationError(response, "Invalid JSON");
    }

    // validation
    if (!(newHistory instanceof Array)) {
      sendValidationError(response, "Not an array");
      return;
    }

    for (const op of newHistory) {
      if (!(Object.hasOwn(op, "operator") && Object.hasOwn(op, "value") && Object.hasOwn(op, "acc"))) {
        sendValidationError(response, "Invalid operation entry format");
        return;
      }
    }

    operationLog = newHistory;
    response.writeHead(200, "OK", { 'Content-Type': 'text/plain' }).end();
  })
}

const handleOperationSubmit = function (request, response) {
  let dataString = ''

  request.on('data', function (data) {
    dataString += data
  })

  request.on('end', function () {
    let input;
    try {
      input = JSON.parse(dataString)
    } catch {
      sendValidationError(response, "Invalid JSON");
    }
    // validate operator is add subtract multiply or divide
    if (!(["plus", "minus", "times", "divide"].includes(input.operator))) {
      sendValidationError(response, "Unsupported operation");
      return;
    }

    // validate value is a real number
    // the null part is because https://wtfjs.com/wtfs/2013-04-28-isfinite-null-is-true
    if (!Number.isFinite(input.value) || input.value === null) {
      sendValidationError(response, "Value is not a number");
      return;
    }

    // simulate perfoming the operation
    var canary = accumulator;
    if (input.operator === "plus")
      canary += input.value;
    else if (input.operator === "minus")
      canary -= input.value;
    else if (input.operator === "times")
      canary *= input.value;
    else if (input.operator === "divide") {
      if (input.value === 0) {
        sendValidationError(response, "Attempted to divide by zero")
        return;
      } else {
        canary /= input.value;
      }
    }

    // see if doing the operation breaks the accumulator
    // in some novel way that gets past the previous validations
    if (!Number.isFinite(canary) || input.value === null) {
      sendValidationError(response, "Unknown error");
      return;
    }

    // do the operation for real and add it to the log
    accumulator = canary
    operationLog.push(new Operation(input.operator, input.value, accumulator))


    response.writeHead(200, "OK", { 'Content-Type': 'text/plain' })
    response.end(JSON.stringify(operationLog))
  })
}

const sendValidationError = function (response, errorMessage) {
  response.writeHead(422, "Unprocessable Content", { 'Content-Type': 'text/plain' });
  response.end(errorMessage);
}

const sendFile = function (response, filename) {
  const type = mime.getType(filename)

  fs.readFile(filename, function (err, content) {

    // if the error = null, then we've loaded the file successfully
    if (err === null) {

      // status code: https://httpstatuses.com
      response.writeHead(200, { 'Content-Type': type })
      response.end(content)

    } else {

      // file not found, error code 404
      response.writeHead(404)
      response.end('404 Error: File Not Found')

    }
  })
}

server.listen(process.env.PORT || port)
