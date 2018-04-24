var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
var express = require('express');
var router = express.Router();

// Require models
var RefreshToken = require('../lib/models/refreshtoken');
var Token = require('../lib/models/token');
var AuthCode = require('../lib/models/authcode');
var Client = require('../lib/models/client');
var shortid = require('shortid');

// Require custom error
var OAuthError = require('../lib/errors/oautherror');
var errorHandler = require('../lib/errors/handler');

// Require middleware
var authorize = require('../lib/middleware/authorize');
var xcode = '';

/* GET 1. Issue Authorization Codes */
router.get('/authorize', function(req, res, next) {
  var responseType = req.query.response_type;
  var clientId = req.query.client_id;
  var redirectUri = req.query.redirect_uri;
  var scope = req.query.scope;
  var state = req.query.state;
  console.log("The Client Id is  "+clientId);
  if (!responseType) {
    next(new OAuthError('invalid_request',
      'Missing parameter: response_type'));
  }

  // if (responseType !== 'code') {
  //   // cancel the request
  //   next(new OAuthError('unsupported_response_type',
  //     'Response type not supported'));
  // }

  // if(!req.query.code) {
  //   res.redirect('/auth');
  // }

  if (!clientId) {
    // cancel the request
    next(new OAuthError('invalid_request',
      'Missing parameter: client_id'));
  }
  if (responseType == 'code' || responseType == 'token') {
      Client.findOne({
        clientId: clientId
      }, function(err, client) { 
        if (err) { 
          next(new OAuthError('invalid_client',
            'Invalid client provided, client malformed or client unknown', err));
        }
        console.log("The Client new "+client);
        if (!client) { //console.log("mali ang CLientId "+client);
          //next(new OAuthError('invalid_client',
            //'Invalid client provided, client malformed or client unknown'));
          res.redirect('/login');
        }

        //if (redirectUri !== client.redirectUri) {
          //next(new OAuthError('invalid_client',
             //'Invalid client provided, client malformed or client unknown'));
        //}

        // if (scope !== client.scope) {
        //   next(new OAuthError('invalid_scope',
        //     'Scope is missing or not well-defined'));
        // }
        //console.log("The client ... "+client);
        var authCode = new AuthCode({
          clientId: clientId,
          //userId: client.userId,
          //redirectUri: client.redirectUri
          redirectUri: req.query.redirect_uri
        });
        //console.log("redirectUri here is..."+client.redirectUri); //google
        authCode.save();
        //xcode = authCode.code;
        var response = {
          state: state,
          code: authCode.code
        };
        //console.log("client.userId = "+client.userId);
        console.log("Token type is "+responseType);
        if (redirectUri) {  console.log("if redirects..."+redirectUri);
          //var redirect = redirectUri +
          //  '?code=' + response.code +
          //  (state === undefined ? '' : '&state=' + state);
          //res.redirect(redirect);
          if (responseType == 'code') {
              res.render('authenticate', {
              authenticateUser: redirectUri+'/?code='+response.code
            });
          } else {
            //let authenticateUser = 'http://google.com';
             res.render('authimplicit', {code: response.code
             
              // authenticateUser: 'https://abe38e48.ngrok.io/token?code='+response.code+'&grant_type=authorization_code'+
              // '&redirect_uri='+redirectUri+'&client_id='+clientId

              //() => {
                // request.post({url:'https://abe38e48.ngrok.io/token',
                //   form: {
                //     code: response.code,
                //     grant_type: 'authorization_code',
                //     redirect_uri: redirectUri,
                //     client_id: clientId
                //   }}, function(error, res, body) {
                //     if (error) {
                //       console.error('request failed', error);
                //     }
                //     var resp = JSON.parse(body); console.log('TOKEN RESPONSE: '+resp);
                //     //res.redirect(redirectUri+'/#access_token=' + resp.access_token+'&token_type='+resp.token_type+'&expires_in='+resp.expires_in);
                //     //res.writeHead(302, {'Location': redirectUri+'/#access_token=' + resp.access_token+'&token_type='+resp.token_type+'&expires_in='+resp.expires_in});
                //   }
                  
                // )
              //}
             });
          }
          
        } else { console.log("ELSE here...")
          res.json(response);
        }
      });
    }
});

function getToken() {
  console.log("getToken Called...");
}
/* POST 2. Issue Access Token */
router.post('/token', function(req, res) { 
  var grantType = '';
  var refreshToken = '';
  var authCode = '';
  var redirectUri = '';
  var clientId = '';

if (req.body.grant_type) {
  grantType = req.body.grant_type;
  refreshToken = req.body.refresh_token;
  authCode = req.body.code;
  redirectUri = '';
  clientId = req.body.client_id;
} else {
  grantType = req.query.grant_type;
  authCode = req.query.code;
  redirectUri = req.query.redirect_uri;
  clientId = req.query.client_id;
}

  //console.log("GrantType: "+grantType +" CLientId: "+clientId+" redirectUri: "+redirectUri);
  
  if (!grantType) {
    return errorHandler(new OAuthError('invalid_request',
      'Missing parameter: grant_type'), res);
  }

  if (grantType === 'authorization_code') {
    AuthCode.findOne({
      code: authCode
    }, function(err, code) { console.log("Auth code : "+code);
      if (err) {
        return errorHandler(new OAuthError('invalid_request',
          'Parameter malformed or invalid', err), res);
      }

      if (!code) {
        return errorHandler(new OAuthError('invalid_request',
          'Parameter malformed or invalid'), res);
      }

      if (code.consumed) {
        return errorHandler(new OAuthError('invalid_grant',
          'Authorization Code expired'), res);
      }

      code.consumed = true;
      code.save();

      // if (code.redirectUri !== redirectUri) {
      //   return errorHandler(new OAuthError('invalid_grant',
      //     'Redirect URI does not match'), res);
      // }
      
      console.log("Kliyente: "+clientId);
      console.log("Kliyente: "+code.clientId);
      Client.findOne({
        clientId: clientId
        //clientId : code.clientId
      }, function(error, client) { console.log("code.userId = "+code.userId); console.log("AAAAAAAAAAAAAAAAAAAAA");
        if (error) { console.log("The Error : "+error);
          return errorHandler(new OAuthError('invalid_client',
            'Invalid client provided, client malformed or client unknown',
            error), res);
        }
        redirectUri = client.redirectUri;
         console.log("AAAAAAAAAAAAAAAAAAAAA222 "+client);
        if (!client) {
          return errorHandler(new OAuthError('invalid_client',
            'Invalid client provided, client malformed or client unknown'),
            res);
        }
        
         console.log("AAAAAAAAAAAAAAAAAAAAA3333");

        var _refreshToken = new RefreshToken({
          userId: code.userId
        });
        _refreshToken.save();

        var _token = new Token({
          refreshToken: _refreshToken.token,
          userId: code.userId
        });
        _token.save();
        
        // send the new token to the consumer
        var response = {
          access_token: _token.accessToken,
          refresh_token: _token.refreshToken,
          expires_in: _token.expiresIn,
          token_type: _token.tokenType,
          redirect_uri: redirectUri
        };
        console.log("Client URI = "+code.redirectUri);
        console.log("Token: "+JSON.stringify(response));
        res.json(response);
        //res.writeHead(302, {'Location': 'https://developers.google.com/oauthplayground/#access_token=' + response.access_token+'&token_type='+response.token_type+'&expires_in='+esponse.expires_in});
      });
    });
  } else if (grantType === 'refresh_token') {
    if (!refreshToken) {
      return errorHandler(new OAuthError('invalid_request',
        'Missing parameter: refresh_token'), res);
    }

    RefreshToken.findOne({
      token: refreshToken
    }, function(err, token) {
      if (err) {
        return errorHandler(new OAuthError('invalid_grant',
          'Refresh Token invalid, malformed or expired',
          err), res);
      }

      if (!token) {
        return errorHandler(new OAuthError('invalid_grant',
          'Refresh Token invalid, malformed or expired'), res);
      }

      // consume all previous refresh tokens
      RefreshToken.update({ 
        userId: token.userId
      }, {
        $set: {consumed: true}
      });
      
      console.log("token.userId = "+token.userId);
      var _refreshToken = new RefreshToken({
        userId: token.userId
      });
      _refreshToken.save();
      console.log("NEW REFRESH TOKEN is = "+_refreshToken);
      var _token = new Token({
        refreshToken: _refreshToken.token,
        userId: token.userId
      });
      _token.save();

      var response = {
        access_token: _token.accessToken,
        refresh_token: _token.refreshToken,
        expires_in: _token.expiresIn,
        token_type: _token.tokenType
      };

      // issue the new token to the consumer
      console.log('new token: '+JSON.stringify(response));
      res.json(response);
    });
  } else {
    return errorHandler(new OAuthError('unsupported_grant_type',
      'Grant type not supported'), res);
  }
});

/* GET 3. Provide Access To Protected Resource */
router.get('/userinfo', authorize, function(req, res) {
  res.send('Protected resource');
});

/* GET Test route to create a new Client  */
router.get('/register', function(req, res, next) {
  if(req.query.email && req.query.username && req.query.password && req.query.redirect_url) {
    var client = new Client({
      email: req.query.email,
      username: req.query.username,
      password : req.query.password,
      passwordConf: req.query.passwordConf,
      //redirectUri: 'http://localhost:5000/callback'
      redirectUri: req.query.redirect_url,
      //redirectUri: 'https://developers.google.com/oauthplayground'
      userId : shortid.generate()
    });
    client.save(function(err) {
      if (err) {
        next(new Error('Client name exists already, please choose other username'));
      } else { //res.end("Save...");
        res.send("clientId: "+client.clientId+"</br>clientSecret: "+client.clientSecret+"</br></br>Your userId is "+client.userId);
         //res.writeHead(302, {'Location': 'http://localhost:5000?clientId=' + client.clientId});
         res.end();
        
      }
    });
  } else {
    res.render('register');
  }
  
});
router.post('/login', function(req, res) {
  //console.log("password is "+req.body.password);
});

router.get('/login', function(req, res) {
  res.render('login');
  
  
});
//var authenticateUser = console.log("DITO ang Token...");
// var authenticateUser = options.url +
//     '?redirect_uri=' + options.redirect_uri +
//     '&user_id=' + options.user_id +
//     '&client_id=' + options.client_id +
//     '&response_type=' + options.response_type +
//     '&state=' + options.state;

router.post('/authenticate', function(req, res, next) {
  if(req.body.email && req.body.password) { console.log(req.body.email+" "+req.body.password);
    Client.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        //req.session.userId = user._id;
       // res.send("Success! Should have button to authenticate here...");
        //return res.redirect('/profile');
        console.log("res ... "+res);
        res.render('authenticate', {
          authenticateUser: authenticateUser
        });
      }
    });
  }
  
});

module.exports = router;