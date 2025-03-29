const {Sequelize,DataTypes} = require('sequelize')
const dbConfig = require('../config/dbConfig')
const { adminSeeder } = require('../adminSeeder')

const sequelize = new Sequelize(dbConfig.db,dbConfig.username,dbConfig.password,{
    host : dbConfig.host,
    dialect : dbConfig.dialect,
    port : 3306,
    pool : {
        min : dbConfig.pool.min,
        max : dbConfig.pool.max,
        idle : dbConfig.pool.idle,
        acquire : dbConfig.pool.acquire
    }
})

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

// models 
db.users = require("./userModel")(sequelize,DataTypes);


sequelize.authenticate().then(async()=>{
    console.log("Database connected successfully..");
    adminSeeder(db.users)
})
.catch((err)=>{
    console.log(err)
})

db.sequelize.sync({force:false}).then(()=>{
    console.log("Migrated !!!")
})

module.exports = db