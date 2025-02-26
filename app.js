const express = require("express");
require("./model/index");
const app = express();
require("dotenv").config()
const passport = require("passport");
const {users}  = require("./model/index");
const generateToken = require("./services/generateToken");
const organizationRoute = require("./routes/organizationRoutes")
const cookieParser = require("cookie-parser")

app.set("view engine","ejs")
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser())

passport.serializeUser(function(user,cb) {
    cb(null,user)
})

passport.deserializeUser(function(obj,cb) {
    cb(null,obj)
})

app.get("/",(req,res) => {
    res.render("home")
})

var userProfile
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
async function(req,res) {
    const userGoogleEmail = userProfile.emails[0].value
    const user = await users.findOne({
        where : {
            email : userProfile.emails[0].value
        }
    })
    if(user) {
        const token = generateToken(user)
        res.cookie("token",token);
        res.redirect("/organization")
    }
    else {
        const user = await users.create({
            email : userGoogleEmail,
            googleId : userProfile.id,
            username : userProfile.displayName
        })

        const token = generateToken(user)
        res.redirect("/organization")
    }
},
function(req,res) {
    res.send("Logged In Successfully")
}
)

app.use("/",organizationRoute)

const PORT = process.env.PORT || 4000
app.listen(PORT,() => {
    console.log(`Server started at port ${PORT}...`)
})