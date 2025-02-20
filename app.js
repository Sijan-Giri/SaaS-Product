const express = require("express");
require("./model/index");
const app = express();
require("dotenv").config()
const passport = require("passport")

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,cb) {
    cb(null,user)
})

passport.deserializeUser(function(obj,cb) {
    cb(null,obj)
})

app.get("/",(req,res) => {
    res.send("Iam alive")
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

const PORT = process.env.PORT || 4000
app.listen(PORT,() => {
    console.log(`Server started at port ${PORT}...`)
})