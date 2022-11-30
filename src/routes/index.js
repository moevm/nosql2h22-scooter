var express = require('express');
var router = express.Router();

let logins = require('../public/logins.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login_page', { title: 'Login' });
});

router.get('/main', (req, res) => {
  res.render('main_page', {title: "Main"})
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

module.exports = router;
