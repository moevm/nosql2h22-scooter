var express = require('express');
var router = express.Router();

let logins = require('../public/users');
let users = require('../public/users');
let scooters = require('../public/scooters');
let warehouses = require('../public/warehouses');
let trips = require('../public/trips');
let unloading_area = require('../public/unloading_area');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login_page', { title: 'Login' });
});

router.get('/main', (req, res) => {
  res.render('main_page', {title: "Main"})
});

router.get('/tariffs', (req, res) => {
  res.render('tariffs', {title: 'Tarrifs'})
});

router.get('/rules', (req, res) => {
  res.render('rules', {title: 'Rules'})
});

router.get('/dbs', (req, res) => {
  res.render('dbs', {title: 'Data Bases'})
});

router.get('/enterLogin', (req, res) => {
  let user_type = 'no'
  //типа запрос к бд
  let login = req.query.login;
  let password = req.query.password;
  //console.log("login = ", login, "\tpassword = ", password)
  for (let i in logins){
    if (logins[i].login == login && logins[i].password == password){
      user_type = logins[i].type;
      break;
    }
  }
  //конец запроса
  console.log("type = ", user_type)
  if (user_type == 'admin'){
    res.redirect('/main')
  } else {
    if (user_type == 'user'){
      res.redirect('/main')
    } else {
      var alert = require('alert');
      alert('Incorrect login or password');
      res.redirect('/')
    }
  }
})

router.get('/aggregated', (req, res) => {
  console.log(req.query);
});

router.get('/clients', (req, res) => {
  //console.log(users)
  let keys = Object.keys(users[0])
  console.log(keys)
  res.render('table', {title: 'Пользователи', keys: keys, data: users});
  //отделить клиентов от админов? Нужно ли выводить пароли?
});

router.get('/scooters', (req, res) => {
  let keys = Object.keys(scooters[0])
  res.render('table', {title: 'Самокаты', keys: keys, data: scooters});
});

router.get('/warehouses', (req, res) => {
  let keys = Object.keys(warehouses[0])
  res.render('table', {title: 'Склады', keys: keys, data: warehouses});
});

router.get('/unloading_area', (req, res) => {
  let keys = Object.keys(unloading_area[0])
  res.render('table', {title: 'Площадки выгрузки', keys: keys, data: unloading_area});
});

router.get('/trips', (req, res) => {
  let keys = Object.keys(trips[0])
  res.render('table', {title: 'Площадки выгрузки', keys: keys, data: trips});
});

module.exports = router;
