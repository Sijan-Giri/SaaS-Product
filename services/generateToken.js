const jwt = require("jsonwebtoken")

const generateToken = async (user) => {
    return jwt.sign({id:user.id},"thisissecret",{
        expiresIn : "2d"
    })
}

module.exports = generateToken