const jwt = require("jsonwebtoken")

const generateToken = (user) => {
    return jwt.sign({id:user.id},process.env.SECRET_KEY,{
        expiresIn : "2d"
    })
}

module.exports = generateToken