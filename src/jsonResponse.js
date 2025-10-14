const fs = require('fs');

const countriesfile = fs.readFileSync(`${__dirname}/../db/countries.json`);
const database = JSON.parse(countriesfile);

// Function that actually sends out data
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
// function for applying search parameters returning the new dataset
function filter(type, restrictions, db = database) {
  // code to limit the returning data
  const restrictedDataset = [];
  o = 0;
  while (db[o]) {
    if (db[o][type].toLowerCase().includes(restrictions.toLowerCase())) {
      restrictedDataset.push(db[o]);
    }
    o++;
  }
  return restrictedDataset;
}

// When there are no restrictions but want only 1 type
function onlyValue(keysToKeep, dataset = database) {
  return dataset.map(item => {
    const newItem = {};
    for (const key of keysToKeep) {
      if (key in item) {
        newItem[key] = item[key];
      }
    }
    return newItem;
  });
}

// Get requests || Status 200
function getBlank(request, response) {
  let {restrictions} = request.headers;
  try{restrictions = JSON.parse(restrictions);}
  catch(error){restrictions = {};}

  let{amount} = request.headers;
  let dataset = database;
  let keysToKeep = [];
  for (const key in restrictions) {
    if (restrictions[key]) {
      dataset = filter(key, restrictions[key], dataset);
      keysToKeep.push(key);
    }
  }
  if(amount === 'justOne'){
    console.log('justOne');
    dataset = onlyValue(keysToKeep,dataset);
    // for (const key in restrictions) {
      
    // }
  }
  
  
  const responseJSON = { message: `${JSON.stringify(dataset)}` };

  return respondJSON(request, response, 200, responseJSON);
}

// Check if the country is already in API if it is return TRUE
function countryCheck(name) {
  o = 0;
  while (database[o]) {
    if (name.toLowerCase() === database[o].name.toLowerCase()) {
      return database[o];
    }
    o++;
  }
  return false;
}

function addCountry(request, response) {
  
  const {
    name, capital, region, nationality,
  } = request.body;
  if(!name || !capital || !region || !nationality){
    badRequest(request,response,true);
  }

  //if the person hit the wrong button have it edit instead of add
  let wrongbutton = countryCheck(name) 
  if(wrongbutton){
     editCountry(request,response)
    return;
  }

  database.push({
    name,
    capital,
    region,
    nationality,
  });
  const responseJSON = {
    message: 'Country added',
  };
  return respondJSON(request, response, 201, responseJSON);
}

function editCountry(request, response) {
  const {
    name, capital, region, nationality,
  } = request.body;
  if(!name){badRequest(request,response,true);}
  const toBeChanged = countryCheck(name);
  toBeChanged.capital = capital;
  toBeChanged.region = region;
  toBeChanged.nationality = nationality;

  const responseJSON = {
    message: 'Update complete',
  };
  return respondJSON(request, response, 204, responseJSON);
}

// bad request 400  NTS: might need rework to be used
function badRequest(request, response, reason) {
  const responseJSON = {
    message: 'Request is valid',
    id: '200',
  };
  if (!request.query.valid || request.query.valid !== 'true' || reason) {
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
  getBlank,

  addCountry,
  editCountry,

  badRequest,
  notFound,
};
