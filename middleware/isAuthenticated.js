const jwt  = require("jsonwebtoken");
const { promisify } = require("util");
const { users } = require("../model");

exports.isAuthenticated = async(req,res,next) => {
    const {token} = req.cookies;

    if(!token) {
        return res.redirect("/")
    }

    const decoded = await promisify(jwt.verify)(token,process.env.SECRET_KEY)

    if(!decoded) {
        return res.redirect("/")
    }

    const userExists = await users.findAll({
        where : {
            id : decoded.id
        }
    })

    if(userExists.length > 0) {
        res.send("Not valid user")
    }
    else {
        req.user = userExists;
        req.userId = userExists[0].id
        next();
    }

}