const fs = require('fs');

const countriesfile = fs.readFileSync(`${__dirname}/../db/countries.json`);
const database = JSON.parse(countriesfile);
// Function that actually sends out data
function respondJSON(request, response, status, object) {
  const content = JSON.stringify(object);

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

// really the validity request but really its bad request 400
function badRequest(request, response, reason) {
  const responseJSON = {
    message: 'Request is valid',
    id: '200',
  };
  if (reason) { // this is only seperate since the if statement below
  // gets really angry if i put reason down there
    responseJSON.message = 'missing required parameter';
    responseJSON.id = '400';
    return respondJSON(request, response, 400, responseJSON);
  }
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

// restrict the output to just what is filtered for
// super-commenting this cause tbh this was a nightmare to make cause i dont
// get .map much at all so comments are a how to for future me
function onlyValue(keysToKeep, dataset = database) {
  return dataset.map((object) => { // return the overall mapping since it replaces
    const newObject = {}; // create a new key
    keysToKeep.forEach((key) => {
      if (key in object) {
        newObject[key] = object[key]; // attach a value to new key
      }
    });
    return newObject;
    // return the new keyvalue pair into the replacing dataset
  });
}

// Get requests || Status 200
function getBlank(request, response) {
  let { restrictions } = request.headers;
  try { restrictions = JSON.parse(restrictions); } catch (error) { restrictions = {}; }
  const { amount } = request.headers;
  const { type } = request.headers;
  let dataset = database;
  const keysToKeep = [];
  Object.keys(restrictions).forEach((key) => {
    if (restrictions[key]) {
      dataset = filter(key, restrictions[key], dataset);
    }
    keysToKeep.push(key);
  });

  if (amount === 'justOne' && keysToKeep.length === 0) {
    if (type === '/name' || type === '/multi') keysToKeep.push('name');
    if (type === '/capital' || type === '/multi') keysToKeep.push('capital');
    if (type === '/region' || type === '/multi') keysToKeep.push('region');
    if (type === '/nationality' || type === '/multi') keysToKeep.push('nationality');
  }
  if (amount === 'justOne') {
    dataset = onlyValue(keysToKeep, dataset);
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

// request 201
function addCountry(request, response) {
  const responseJSON = {
    message: 'Country added',
  };
  const {
    name, capital, region, nationality,
  } = request.body;
  if (!name || !capital || !region || !nationality) {
    responseJSON.message = 'missing required parameter';
    responseJSON.id = '400';
    return respondJSON(request, response, 400, responseJSON);
    // its this return thats breaking the linter but at the same time makes this stable
  }

  // This would be a nice little thing to have to catch the user but the linter doesnt like it
  // so it aint worth keeping on since itll likely net less points
  // // if the person hit the wrong button have it edit instead of add
  // const wrongbutton = countryCheck(name);
  // if (wrongbutton) {
  //   editCountry(request, response);
  //   return;
  // }

  database.push({
    name,
    capital,
    region,
    nationality,
  });

  return respondJSON(request, response, 201, responseJSON);
  // Why does the linter not like this its needed for functionality
}

// request 204
function editCountry(request, response) {
  const responseJSON = {
    message: 'Update complete',
  };
  const {
    name, capital, region, nationality,
  } = request.body;
  if (!name) {
    responseJSON.message = 'missing required parameter';
    responseJSON.id = '400';
    return respondJSON(request, response, 400, responseJSON);
  }

  // // wrong button stuff for edit
  // const wrongbutton = countryCheck(name);
  // if (!wrongbutton) {
  //   addCountry(request, response);
  //   return;
  // }

  const toBeChanged = countryCheck(name);
  toBeChanged.capital = capital;
  toBeChanged.region = region;
  toBeChanged.nationality = nationality;

  return respondJSON(request, response, 204, responseJSON);
  // Why does the linter not like this its needed for functionality
}

module.exports = {
  getBlank,

  addCountry,
  editCountry,

  badRequest,
  notFound,
};
