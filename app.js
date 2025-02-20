const express = require("express");
require("./model/index");
const app = express();
require("dotenv").config()
const passport = require("passport")

app.set("view engine","ejs")
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,cb) {
    cb(null,user)
})

passport.deserializeUser(function(obj,cb) {
    cb(null,obj)
})

app.get("/",(req,res) => {
    res.render("home")
})

let GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    callbackURL : "http://localhost:3000/auth/google/callback"
},
function(accessToken,refreshToken,profile,done) {
    userProfile = profile
    return done(null,userProfile)
}
))

app.get("/auth/google",passport.authenticate("google",{scope : ["profile","email"]}));

app.get("/auth/google/callback",passport.authenticate("google",{
    failureRedirect : "http://localhost:3000"
}),
function(req,res) {
    res.send("Logged In Successfully")
}
)

const PORT = process.env.PORT || 4000
app.listen(PORT,() => {
    console.log(`Server started at port ${PORT}...`)
})