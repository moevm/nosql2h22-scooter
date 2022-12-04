var express = require('express');
var router = express.Router();

let aggregated = require('../public/aggregated')

let neo4j = require('neo4j-driver')
var uri = "neo4j://localhost:7687"
var user = "neo4j"
var password = "0000"
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
session = driver.session()

async function getBd(){
  let result = await session.run(
      'MATCH (a) RETURN a'
  )
  console.log(result)
}

async function getClients(){
  let users = []
  let result = await session.run(
      'MATCH (a:USER) RETURN a'
  )
  for (let i in result.records){
    users.push(result.records[i].get(0).properties)
  }
  return users
}

async function getScooters(){
  let scooters = []
  let result = await session.run(
      'MATCH (a:SCOOTER) RETURN a'
  )
  for (let i in result.records){
    scooters.push(result.records[i].get(0).properties)
  }
  return scooters
}

async function getWarehouses(){
  let warehouses = []
  let result = await session.run(
      'MATCH (a:WAREHOUSE) RETURN a'
  )
  for (let i in result.records){
    warehouses.push(result.records[i].get(0).properties)
  }
  return warehouses
}

async function getTrips(){
  let trips = []
  let result = await session.run(
      'MATCH (a:TRIP) RETURN a'
  )
  for (let i in result.records){
    trips.push(result.records[i].get(0).properties)
  }
  return trips
}

async function getUnloadingAreas(){
  let unloading_areas = []
  let result = await session.run(
      'MATCH (a:UNLOADING_AREA) RETURN a'
  )
  for (let i in result.records){
    unloading_areas.push(result.records[i].get(0).properties)
  }
  return unloading_areas
}

/* GET home page. */
router.get('/', function(req, res) {
  let cookies = req.cookies;
  if (!cookies.type) {
    res.render('login_page', {title: 'Login'});
  } else {
    res.redirect('/main')
  }
});

router.get('/main', (req, res) => {
  let type = req.cookies.type;
  if (type) {
    res.render('main_page', {title: "Main", type: type});
  } else {
    res.redirect('/');
  }
});

router.get('/tariffs', (req, res) => {
  res.render('tariffs', {title: 'Tariffs'})
});

router.get('/rules', (req, res) => {
  res.render('rules', {title: 'Rules'})
});

router.get('/dbs', async (req, res) => {
  let users = await getClients()
  let scooters = await getScooters()
  let warehouses = await getWarehouses()
  let unloading_areas = await getUnloadingAreas()
  console.log(warehouses)
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('dbs', {title: 'Data Bases', users: users, scooters: scooters, warehouses: warehouses, unloading_area: unloading_areas})
  } else if (type === 'user') {
    res.redirect('/main');
  } else {
    res.redirect('/')
  }
});

router.get('/enterLogin', async (req, res) => {
  let user_type = ''
  let user_id = ''
  let login = req.query.login;
  let password = req.query.password;
  let result = await session.run(
      'match (user:USER {login: $login, password: $password})  \n' +
      'return user',
      {login: login, password: password}
  )
  if (result.records.length > 0)
  {
    result = result.records[0].get(0).properties
    user_type = result.type;
    user_id = result.phone;
    res.cookie("type", user_type);
    res.cookie("user id", user_id);
  }
  //console.log(user_type)
  if (user_type === 'admin' || user_type === 'user'){
    res.redirect('/main')
  } else {
    var alert = require('alert');
    alert('Incorrect login or password');
    res.redirect('/')
  }
})

router.get('/aggregated', (req, res) => {
  let type = req.cookies.type;
  if (type === 'admin') {
    console.log("var = ", req.query.variant);
    let variant = req.query.variant;
    if (variant === '0'){
      let keys = Object.keys(aggregated[0][0])
      res.render('table', {title: 'Пользователи, которые больше всего ломают самокаты', keys: keys, data: aggregated[0]})
    } else if (variant === '1') {
      let keys = Object.keys(aggregated[1][0])
      res.render('table', {title: 'Пользователи, у которых давно не было поздок', keys: keys, data: aggregated[1]})
    } else {
      let keys = Object.keys(aggregated[2][0])
      res.render('table', {title: 'Самые далекие от складов самокаты', keys: keys, data: aggregated[2]})
    }
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/clients', async (req, res) => {
  let users = await getClients()
  //getBd()
  let keys = Object.keys(users[0])
  console.log(keys)
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Пользователи', keys: keys, data: users});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
  //отделить клиентов от админов? Нужно ли выводить пароли?
});

router.get('/scooters', async (req, res) => {
  let scooters = await getScooters()
  console.log(scooters)
  let keys = Object.keys(scooters[0])
  console.log(keys)
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Самокаты', keys: keys, data: scooters});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/warehouses', async (req, res) => {
  let warehouses = await getWarehouses()
  let keys = Object.keys(warehouses[0])
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Склады', keys: keys, data: warehouses});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/unloading_area', async (req, res) => {
  let unloading_areas = await getUnloadingAreas()
  let keys = Object.keys(unloading_areas[0])
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Площадки выгрузки', keys: keys, data: unloading_areas});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/trips', async (req, res) => {
  let trips = await getTrips()
  let keys = Object.keys(trips[0])
  let type = req.cookies.type;
  if (type === 'admin') {
    res.render('table', {title: 'Поездки', keys: keys, data: trips});
  } else if (type === 'user') {
    res.redirect('/main')
  } else {
    res.redirect('/')
  }
});

router.get('/exit', (req, res) => {
  res.clearCookie('type');
  res.clearCookie('user id');
  res.redirect('/')
});

async function attachedToScooters(scooter){
  let attachedToScooters = []
  let result = await session.run(
      'match (sc:SCOOTER{number: $number})-[net]-(node) \n' +
      'return sc,net,node',
      {number: scooter}
  )
  for (let i in result.records){
    let scooter = result.records[i].get(0).properties

    let relationship = result.records[i].get(1).type //HAS_NOW/TALKS_ABOUT/USED

    let attachedTo = result.records[i].get(2)

    let dict = {'scooter': scooter.number + '(scooter)', 'relationship': relationship, 'attachedTo': attachedTo}
    attachedToScooters.push(dict)
  }

  return attachedToScooters
}

async function attachedToUsers(user){
  let attachedToUsers = []
  let result = await session.run(
      'match (us:USER{login: $login})-[net]-(node) \n' +
      'return us,net,node',
      {login: user}
  )
  for (let i in result.records){
    let user = result.records[i].get(0).properties.login

    let relationship = result.records[i].get(1).type //HAS_NOW/TALKS_ABOUT/USED

    let attachedTo = result.records[i].get(2)

    let dict = {'user': user + '(user)', 'relationship': relationship, 'attachedTo': attachedTo}
    attachedToUsers.push(dict)
  }

  return attachedToUsers
}

async function attachedToWarehouses(warehouse){
  let attachedToWarehouses = []
  let result = await session.run(
      'match (wr:WAREHOUSE{number: $number})-[net]-(node) \n' +
      'return wr,net,node',
      {number: warehouse}
  )
  for (let i in result.records){
    let warehouse = result.records[i].get(0).properties.number

    let relationship = result.records[i].get(1).type //HAS_NOW/TALKS_ABOUT/USED

    let attachedTo = result.records[i].get(2)

    let dict = {'warehouse': warehouse + '(warehouse)', 'relationship': relationship, 'attachedTo': attachedTo}
    attachedToWarehouses.push(dict)
  }

  return attachedToWarehouses
}

async function attachedToUnloadingAreas(unloading_area){
  let attachedToUnloadingAreas = []
  let result = await session.run(
      'match (ua:UNLOADING_AREA{number: $number})-[net]-(node) \n' +
      'return ua,net,node',
      {number: unloading_area}
  )
  for (let i in result.records){
    let unloading_area = result.records[i].get(0).properties.number

    let relationship = result.records[i].get(1).type //HAS_NOW/TALKS_ABOUT/USED

    let attachedTo = result.records[i].get(2)

    let dict = {'unloading_area': unloading_area + '(unloading area)', 'relationship': relationship, 'attachedTo': attachedTo}
    attachedToUnloadingAreas.push(dict)
  }

  return attachedToUnloadingAreas
}

router.get('/free-choice', async (req, res) => {
  let relationships = []

  if (req.query.scooters)
  {
    if (typeof(req.query.scooters) == 'string')
    {
      relationships.push(await attachedToScooters(req.query.scooters))
    }
    else
    {
      for (let i in req.query.scooters)
      {
        relationships.push(await attachedToScooters(req.query.scooters[i]))
      }
    }
    //Поправить!!!
  }

  if (req.query.users)
  {
    if (typeof(req.query.users) == 'string')
    {
      relationships.push(await attachedToUsers(req.query.users))
    }
    else
    {
      for (let i in req.query.users)
      {
        relationships.push(await attachedToUsers(req.query.users[i]))
      }
    }
  }

  if (req.query.warehouses)
  {
    if (typeof(req.query.warehouses) == 'string')
    {
      relationships.push(await attachedToWarehouses(req.query.warehouses))
    }
    else
    {
      for (let i in req.query.warehouses)
      {
        relationships.push(await attachedToWarehouses(req.query.warehouses[i]))
      }
    }
  }

  if (req.query.unloading_areas)
  {
    if (typeof(req.query.unloading_areas) == 'string')
    {
      relationships.push(await attachedToUnloadingAreas(req.query.unloading_areas))
    }
    else
    {
      for (let i in req.query.unloading_areas)
      {
        relationships.push(await attachedToUnloadingAreas(req.query.unloading_areas[i]))
      }
    }
  }
  let keys = ['node1', 'relationship','node2']
  res.render('filter_table', {title: 'Фильтры', keys: keys, data: relationships})
});

router.get('/add_scooter', async (req, res) =>
{
  let warehouses = await getWarehouses();
  res.render('add_scooter', {warehouses: warehouses})
})

router.get('/add_edit_scooter', (req, res) =>
{
  console.log(req.query)
  res.redirect('/add_scooter')
})

router.post('/filter/:title', async (req, res) =>
{
  console.log(req.body)
  let title = req.params.title
  console.log("title = ", title)
  switch (title)
  {
    case 'Пользователи':
      res.redirect('/clients');
      break;
    case 'Самокаты':
      res.redirect('/scooters');
      break;
    case 'Склады':
      res.redirect('/warehouses');
      break;
    case 'Площадки выгрузки':
      res.redirect('/unloading_area');
      break;
    case 'Поездки':
      res.redirect('/trips');
      break;
  }

})

module.exports = router;
