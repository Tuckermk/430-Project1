
const fs = require('fs');
const countriesfile = fs.readFileSync(`${__dirname}/../db/countries.json`)
const db = JSON.parse(countriesfile);

//Function that actually sends out data
function respondJSON(request, response, status, object) {
  const content = JSON.stringify(object);
  //   console.log(content);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  response.end();
}


//function for applying search parameters returning the new dataset
function restrict(dataset,restriction){
   //code to limit the returning data 
   let restrictedDataset = [];
   if(dataset === 'name'){
      o = 0;
      while(db[o]){
         if (db[o].name.toLowerCase() === restriction.toLowerCase()) {
            restrictedDataset.push(db[o]);
         }
         o++;
      }
      
   }
   else if(dataset === 'capital'){

   }

   return restrictedDataset;
}

function onlyValue(dataset){
   let restrictedDataset = [];
   if(dataset === 'name'){
      o = 0;
      while(db[o]){ 
         restrictedDataset.push(db[o].name);
         o++;
      }
   }
   if(dataset === 'capital'){
      o = 0;
      while(db[o]){ 
         restrictedDataset.push(db[o].capital);
         o++;
      }
   }
   return restrictedDataset;
}

//get Country Names || 200 status
function getNames(request, response){
   const restriction = request.headers.restriction;
   let dataset = onlyValue('name');
   if(restriction){
      dataset = restrict('name',restriction)
   }
   const responseJSON = {message: `${JSON.stringify(dataset)}`};
   console.log(dataset);
   return respondJSON(request,response,200, responseJSON)
}

// get Capitals || 200 status
function getCapitals(request, response, restriction){
   const responseJSON = {message: 'bop'};

   return respondJSON(request,response,200, responseJSON)
}

// get Region || 200 status
function getRegion(request, response, restriction){
   const responseJSON = {message: 'boop'};

   return respondJSON(request,response,200, responseJSON)
}

// get Coordinates || 200 status
function getCoords(request, response, restriction){
   const responseJSON = {message: 'boom'};

   return respondJSON(request,response,200, responseJSON)
}


// bad request 400  NTS: might need rework to be used 
function badRequest(request, response) { 
  const responseJSON = {
    message: 'Request is valid',
    id: '200',
  };
  if (!request.query.valid || request.query.valid !== 'true') {
    responseJSON.message = 'missing required parameter';
    responseJSON.id = '400';
    return respondJSON(request, response, 400, responseJSON);
  }
  return respondJSON(request, response, 200, responseJSON);
}

// error 404
function notFound(request, response) { 
  const responseJSON = {
    message: 'does not exist',
    id: '404',
  };
  return respondJSON(request, response, 404, responseJSON);
}


module.exports = {
   getNames,
   getCapitals,
   getRegion,
   getCoords,
   
   badRequest,
   notFound,
}