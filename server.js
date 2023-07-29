const express = require("express");
const fs = require("fs");
var session = require('express-session');
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(session({
    secret: 'iAmSecret',
    resave: true,
    saveUninitialized: true
  }))

  
app.use(express.static("public"));
app.use(function(req, res, next){
    console.log(req.url, req.method);
    next();
})

app.get("/", function(req, res){
    if(req.session.isLoggedIn){
        showData(req.session.user, function(err, data){
            if(err){
                console.log(err);
            }else{
                res.render("index", {isUserLoggedIn : "true", user: req.session.user, data: data});
                return; 
            }
        })
    }else{
        res.render("index", {isUserLoggedIn : false, user: "", data: ""})
    }
    
})

app.get("/login", function(req, res){
    res.sendFile(__dirname + "/public/login.html");
})

app.get("/signup", function(req, res){
    res.sendFile(__dirname + "/public/signup.html");
})

app.get('/logout',  function (req, res, next)  {
    if (req.session) {
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

app.get("/login-error",function(req, res){
    res.sendFile(__dirname + "/public/loginerror.html")
})

app.get("/signup-error",function(req, res){
    res.sendFile(__dirname + "/public/signuperror.html")
})

app.post("/login",function(req,res){
    // const username = req.body.username;
    // const password = req.body.password;
    // if(username === "harsh" && password === "12"){
    //     req.session.user = username;
    //     req.session.isLoggedIn = true;
    //     res.redirect("/");
    // }else{
    //     res.sendFile(__dirname+"/public/loginerror.html");
    // }
    readCredentials(req.body, function(err, isValid){
        if(err){
            res.redirect("/login");
        }else{
            if(isValid){
                req.session.user = req.body.username;
                req.session.isLoggedIn = true;
                res.redirect("/");
            }
            else{
                res.redirect("/login-error");
            }
        }
    })
})


app.post("/signup",function(req,res){
    // const username = req.body.username;
    // const password = req.body.password;
    // if(username === "harsh" && password === "12"){
    //     req.session.user = username;
    //     req.session.isLoggedIn = true;
    //     res.redirect("/");
    // }else{
    //     res.sendFile(__dirname+"/public/loginerror.html");
    // }
    saveCredentials(req.body, function(err, isRegistered){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }else{
            if(!isRegistered){
                res.redirect("/login");
            }else{
                res.redirect("/signup-error");
            }
        }
    })
})

app.post("/add-data", function(req, res){
    saveData(req.session.user ,req.body.inputData, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/");
    })
})

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})


function readCredentials(credential, callback){
    fs.readFile("./public/data.json", "utf-8", function(err, data){
        if(err){
            callback(err);
        }else{
            if(data.length === 0){
                data = "[]";
            }
            try{
                const credentials = JSON.parse(data);
                let isValid = false;
                credentials.forEach(function(element){
                    if(element.username === credential.username && element.password === credential.password){
                        isValid = true;
                        return;
                    }
                })
                callback(null, isValid);
            }
            catch(err){
                callback(err);
            }
        }
    })
}

function saveCredentials(credential, callback){
    fs.readFile("./public/data.json", "utf-8", function(err, data){
        if(err){
            callback(err);
        }else{
            if(data.length === 0){
                data = "[]";
            }
            try{
                let credentials = JSON.parse(data);
                let isRegistered = false;
                const allCredentials = credentials.filter(function(element){
                    if(element.username === credential.username){
                        isRegistered = true;
                        return element;
                    }else{
                        return element;
                    }
                })
                if(isRegistered){
                    callback(null, isRegistered);
                }else{
                    credential.data = "";
                    allCredentials.push(credential);
                    fs.writeFile("./public/data.json", JSON.stringify(allCredentials), function(err){
                        callback(null, null);
                        if(err){
                            callback(err);
                        }
                    } )
                }
            }
            catch(err){
                callback(err);
            }
        }}
    )}

function saveData(username, textData, callback){
    fs.readFile("./public/data.json", "utf-8", function(err, data){
        if(err){
            callback(err);
        }else{
            try{
                let credentials = JSON.parse(data);
                const allCredentials = credentials.filter(function(element){
                    if(element.username === username){
                        element.data = element.data + " " +textData;
                    }
                        return element;
                    })
                    fs.writeFile("./public/data.json", JSON.stringify(allCredentials), function(err){
                        if(err){
                            callback(err);
                        }else{
                            callback(null);
                        }
            })}

            catch(err){
                callback(err);
            }
        }}
    )}

function showData(username, callback){
    fs.readFile("./public/data.json", "utf-8", function(err, data){
        if(err){
            callback(err);
        }else{
            try{
                let credentials = JSON.parse(data);
                let userText = "";
                credentials.map(function(element){
                    if(element.username === username){
                        userText = element.data;
                        return;
                    }})
                    callback(null, userText);
                }

            catch(err){
                callback(err);
            }
        }}
    )}
