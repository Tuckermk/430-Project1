
const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponse.js');
const jsonHandler = require('./jsonResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle incoming data to make it usable
const parseBody = (request, response, handler) => {
  const body = [];
  request.on('error', () => {
    response.statusCode = 400;
    response.end();
  });
  request.on('data', (chunk) => {
    body.push(chunk);
  });
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);
    handler(request, response);
  });
};



// all possible request pathes the server will use
const pathes = {
   //html pathes
   '/': htmlHandler.getIndex,
   '/style.css': htmlHandler.getCSS,
   //json pathes
   '/countries': jsonHandler.getNames,
   '/capitals': jsonHandler.getCapitals,
   '/regions': jsonHandler.getRegion,
   '/coords': jsonHandler.getCoords,
   '/nationality': jsonHandler.getNationality,

   //error pathes **NTS: Might be worth adding other errors
  '/badRequest': jsonHandler.badRequest,
  notFound: jsonHandler.notFound,   
}

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
   if(pathes[parsedUrl.pathname]){
      pathes[parsedUrl.pathname](request,response);
   }
   else {
      pathes.notFound(request,response);
   }

};
// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addCountry') {
    parseBody(request, response, jsonHandler.addCountry);
  }
  if (parsedUrl.pathname === '/editCountry') {
    parseBody(request, response, jsonHandler.editCountry);
  }
};


const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  if (request.method === 'POST') {
      // console.log("POST");
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port);
