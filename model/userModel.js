module.exports = (sequelize,DataTypes)=>{
    const User = sequelize.define("user",{
        email : {
            type : DataTypes.STRING,
            allowNull : false,
            unique : true
        },
        username : {
            type : DataTypes.STRING,
            allowNull : false
        },
        googleId : {
            type : DataTypes.STRING,
            allowNull : false,
            unique : true
        },
        currentOrgNumber : {
            type : DataTypes.INTEGER   
        },
        role : {
            type : DataTypes.ENUM('user','admin'),
            defaultValue : 'user'
        }
    })
    return User
}