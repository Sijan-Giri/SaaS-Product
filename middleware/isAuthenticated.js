const jwt  = require("jsonwebtoken");
const { promisify } = require("util");
const { users } = require("../model");

exports.isAuthenticated = async(req,res,next) => {
    const {token} = req.cookies;

    if(!token) {
        return res.redirect("/")
    }

   try {
    const decoded = await promisify(jwt.verify)(token,process.env.SECRET_KEY)
    if(!decoded) {
        return res.redirect("/")
    }

    const userExists = await users.findOne({
        where : {
            id : decoded.id
        }
    })

    if(!userExists) {
        return res.send("Not valid user")
    }
        req.user = userExists;
        req.userId = userExists.id
        next();
    
   } catch (error) {
    return res.send(error)
   }

}