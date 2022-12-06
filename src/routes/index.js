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

async function addEditScooter(info){
  let result = await session.run(
      'MERGE (a:SCOOTER {number: $number}) <- [net:TALKS_ABOUT] - (tech:TECH_CARD)\n' +
      'ON CREATE SET a.battery = \'100\', a.coordinate_x = \'null\', a.coordinate_y = \'null\', a.status = $status, ' +
      'tech.creationYear = $creation_year, tech.manufacturer = $manufacturer, tech.maxPowerCapacity = $max_power_cap, tech.mileage = $mileage\n' +
      'ON MATCH SET a.status = $status,' +
      'tech.mileage = $mileage\n' +
      'return a, net, tech',
      {number: info.number, creation_year: info.creation_year, manufacturer: info.manufacturer,
        max_power_cap: info.max_power_cap, mileage: info.mileage, status: info.status}
  )
  return result
}

router.get('/add_edit_scooter', async (req, res) =>
{
  console.log(req.query)
  await addEditScooter(req.query)
  res.redirect('/add_scooter')
})

router.post('/filter/:title', async (req, res) =>
{
  //console.log(req.body)
  let title = req.params.title
  //console.log("title = ", title)
  let result = '';
  let keys = '';
  switch (title)
  {
    case 'Пользователи':
      result = await session.run(
        'match (user:USER) \n' +
        'WHERE user.name CONTAINS $name and user.password CONTAINS $password and user.login CONTAINS $login and ' +
        'user.type CONTAINS $type and user.phone CONTAINS $phone\n' +
        'return user',
        {name: req.body.name, password: req.body.password, login: req.body.login, type: req.body.type, phone: req.body.phone}
    );
      let users = [];
      for (let i in result.records)
      {
        users.push(result.records[i].get(0).properties)
      }
      keys = ['name', 'password', 'login', 'type', 'phone'];
      res.render('table', {title: title, keys: keys,data: users});
      break;
    case 'Самокаты':
      let start_number = req.body.start_number === ''? -1: +req.body.start_number-1;
      let stop_number = req.body.stop_number === ''? Number.MAX_SAFE_INTEGER: +req.body.stop_number+1;
      let start_battery = req.body.start_battery === '' ? -1: +req.body.start_battery-1;
      let stop_battery = req.body.stop_battery === ''? 101: +req.body.stop_battery+1;
      let start_coord_x = req.body.start_coordinate_x === ''? -181: +req.body.start_coordinate_x-1;
      let stop_coord_x = req.body.stop_coordinate_x === ''? 181: +req.body.stop_coordinate_x+1;
      let start_coord_y = req.body.start_coordinate_y === ''? -91: +req.body.start_coordinate_y-1;
      let stop_coord_y = req.body.stop_coordinate_y === ''? 91: +req.body.stop_coordinate_y+1;
      let status = req.body.status;

      result = await session.run(
          'match (sc:SCOOTER) \n' +
          'WHERE sc.number > $start_number and sc.number < $stop_number and ' +
          'sc.battery > $start_battery and sc.battery < $stop_battery and ' +
          'sc.coordinate_x > $start_coord_x and sc.coordinate_x < $stop_coord_x and ' +
          'sc.coordinate_y > $start_coord_y and sc.coordinate_y < $stop_coord_y and ' +
          'sc.status CONTAINS $status\n' +
          'return sc',
          {start_number: start_number, stop_number: stop_number, start_battery: start_battery, stop_battery: stop_battery, start_coord_x: start_coord_x,
            stop_coord_x: stop_coord_x, start_coord_y: start_coord_y, stop_coord_y: stop_coord_y, status:status}
      );

      let scooters = [];
      for (let i in result.records)
      {
        scooters.push(result.records[i].get(0).properties)
      }
      keys = ['number', 'battery', 'coordinate_x', 'coordinate_y', 'status'];
      res.render('table', {title: title, keys: keys, data: scooters});
      break;
    case 'Склады':
      let minNum =  req.body.start_houseNumber === '' ? -1: +req.body.start_houseNumber-1;
      let maxNum =  req.body.stop_houseNumber === '' ? Number.MAX_SAFE_INTEGER: +req.body.stop_houseNumber+1;
      result = await session.run(
          'match (wh:WAREHOUSE) \n' +
          'WHERE wh.houseNumber > $minNum and wh.houseNumber < $maxNum\n' +
          'return wh',
          {minNum: minNum, maxNum: maxNum}
      );
      let whs = [];
      for (let i in result.records)
      {
        whs.push(result.records[i].get(0).properties)
      }
      keys = ['houseNumber'];
      res.render('table', {title: title, keys: keys,data: whs});
      break;
    case 'Площадки выгрузки':
      let coord_x1 = req.body.start_coordinate_x === ''? -181: +req.body.start_coordinate_x-1;
      let coord_x2 = req.body.stop_coordinate_x === ''? 181: +req.body.stop_coordinate_x+1;
      let coord_y1 = req.body.start_coordinate_y === ''? -91: +req.body.start_coordinate_y-1;
      let coord_y2 = req.body.stop_coordinate_y === ''? 91: +req.body.stop_coordinate_y+1;

      result = await session.run(
          'match (area:UNLOADING_AREA) \n' +
          'WHERE area.address CONTAINS $address and ' +
          'area.coordinate_x > $start_coord_x and area.coordinate_x < $stop_coord_x and ' +
          'area.coordinate_y > $start_coord_y and area.coordinate_y < $stop_coord_y\n' +
          'return area',
          {address: req.body.address, start_coord_x: coord_x1, stop_coord_x: coord_x2, start_coord_y: coord_y1, stop_coord_y: coord_y2}
      );
      let areas = [];
      for (let i in result.records)
      {
        areas.push(result.records[i].get(0).properties)
      }
      keys = ['address', 'coordinate_x', 'coordinate_y'];
      res.render('table', {title: title, keys: keys, data: areas});
      break;
    case 'Поездки':
      let cost1 = req.body.start_cost === '' ? -1: +req.body.start_cost-1;
      let cost2 = req.body.stop_cost === '' ? Number.MAX_SAFE_INTEGER: +req.body.stop_cost+1;
      let time_end1 = req.body.start_time_end === '' ? -1: +req.body.start_time_end-1;
      let time_end2 = req.body.stop_time_end === '' ? Number.MAX_SAFE_INTEGER: +req.body.stop_time_end+1;
      let time_start1 = req.body.start_time_start === '' ? -1: +req.body.start_time_start-1;
      let time_start2 = req.body.stop_time_start === '' ? Number.MAX_SAFE_INTEGER: +req.body.stop_time_start+1;
      let trip_status = +req.body.status;

      result = await session.run(
          'match (trip:TRIP) \n' +
          'WHERE trip.cost > $minCost and trip.cost < $maxCost and ' +
          'trip.time_end > $minTimeEnd and trip.time_end < $maxTimeEnd and ' +
          'trip.time_start > $minTimeStart and trip.time_start < $maxTimeStart and ' +
          'trip.status = $status\n' +
          'return trip',
          {minCost: cost1, maxCost: cost2, minTimeEnd: time_end1, maxTimeEnd: time_end2,
          minTimeStart: time_start1, maxTimeStart: time_start2, status: trip_status}
      );

      let trips = [];
      for (let i in result.records)
      {
        trips.push(result.records[i].get(0).properties)
      }
      keys = ['cost', 'time_end', 'time_start', 'status'];
      res.render('table', {title: title, keys: keys, data: trips});
      break;
  }

})

router.get('/export', (req, res) =>
{
  console.log("export")
  res.redirect('/dbs')
})
router.get('/import', (req, res) =>
{
  console.log(req.query)
  let path = req.query.path[req.query.path.length-1] === '/' ? req.query.path : req.query.path+'/'
  let f = require(path + req.query.file)
  console.log("file:\n", f)
  res.redirect('/dbs')
})

module.exports = router;
