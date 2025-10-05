
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
let o;
//NTS: this is so on the border of DRY so ask about it/ rework it
//function for applying search parameters returning the new dataset
function restrict(dataset,restrictions){
   //code to limit the returning data 
   let restrictedDataset = [];
   if(dataset === 'name'){
      o = 0;
      while(db[o]){
         if (db[o].name.toLowerCase().includes(restrictions.toLowerCase())) {
            restrictedDataset.push(db[o]);
         }
         o++;
      }
      
   }
   else if(dataset === 'capital'){
      o = 0;
      while(db[o]){
         if (db[o].capital.toLowerCase().includes(restrictions.toLowerCase())) {
            restrictedDataset.push(db[o]);
         }
         o++;
      }
   }
   else if(dataset === 'region'){
      o = 0;
      while(db[o]){
         if (db[o].capital.toLowerCase().includes(restrictions.toLowerCase())) {
            restrictedDataset.push(db[o]);
         }
         o++;
      }
   }
   else if(dataset === 'nationality'){
      o = 0;
      while(db[o]){
         if (db[o].nationality.toLowerCase().includes(restrictions.toLowerCase())) {
            restrictedDataset.push(db[o]);
         }
         o++;
      }
   }

   //NTS: Needs to be done uniquely probably
   else if(dataset === 'coords'){
      o = 0;
      while(db[o]){
         if (db[o].capital.toLowerCase().includes(restrictions.toLowerCase())) {
            restrictedDataset.push(db[o]);
         }
         o++;
      }
   }

   return restrictedDataset;
}

//When there are no restrictions but want only 1 type
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
   if(dataset === 'region'){
      o = 0;
      while(db[o]){ 
         restrictedDataset.push(db[o].region);
         o++;
      }
   }
   if(dataset === 'coords'){
      o = 0;
      while(db[o]){ 
         restrictedDataset.push(db[o].capital);
         o++;
      }
   }
   if(dataset === 'nationality'){
      o = 0;
      while(db[o]){ 
         restrictedDataset.push(db[o].nationality);
         o++;
      }
   }
   return restrictedDataset;
}

let restriction;
//get Country Names || 200 status
function getNames(request, response){
   restriction = request.headers.restriction;
   let dataset = onlyValue('name');
   if(restriction){
      dataset = restrict('name',restriction)
   }
   const responseJSON = {message: `${JSON.stringify(dataset)}`};
   // console.log(dataset);
   return respondJSON(request,response,200, responseJSON)
}

// get Capitals || 200 status
function getCapitals(request, response, restriction){
   restriction = request.headers.restriction;
   let dataset = onlyValue('capital');
   if(restriction){
      dataset = restrict('capital',restriction)
   }
   const responseJSON = {message: `${JSON.stringify(dataset)}`};

   return respondJSON(request,response,200, responseJSON)
}

// get Region || 200 status
function getRegion(request, response, restriction){
   restriction = request.headers.restriction;
   let dataset = onlyValue('region');
   if(restriction){
      dataset = restrict('region',restriction)
   }
   const responseJSON = {message: `${JSON.stringify(dataset)}`};

   return respondJSON(request,response,200, responseJSON)
}


function getNationality(request, response, restriction){
   restriction = request.headers.restriction;
   let dataset = onlyValue('nationality');
   if(restriction){
      dataset = restrict('nationality',restriction)
   }
   const responseJSON = {message: `${JSON.stringify(dataset)}`};

   return respondJSON(request,response,200, responseJSON)
}



//NTS DO THIS SEPERATELY
// get Coordinates || 200 status
function getCoords(request, response, restriction){
   const responseJSON = {message: 'boom'};

   return respondJSON(request,response,200, responseJSON)
}

//Check if the country is already in API if it is return TRUE
function countryCheck(name){
   o = 0;
   while(db[o]){
     if (name.toLowerCase() === db[o].name.toLowerCase()) {
         return db[o];
      }
      o++;
   }
   return false;
}

function addCountry(request,response){
   // let wrongbutton = countryCheck //assigns the object that has the matching name to send to edit
   // if(wrongbutton){
   //    editCountry(request,response, wrongbutton)
   //    return;
   // }
   const {name, capital, region, nationality} = request.body;
   //NTS ADD STATUS 400 HERE
   db.push({
      name,
      capital,
      region,
      nationality
   }) 
   const responseJSON = {
    message: 'Country added',
  };
   return respondJSON(request, response, 201, responseJSON);
}

function editCountry(request,response,){
   const {name, capital, region, nationality} = request.body;
   const toBeChanged = countryCheck(name)
   toBeChanged.capital = capital;
   toBeChanged.region = region;
   toBeChanged.nationality = nationality;

   const responseJSON = {
    message: 'Update complete',
  };
   return respondJSON(request, response, 204, responseJSON);
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
   getNationality,
   
   addCountry,
   editCountry,
   
   badRequest,
   notFound,
}