const { QueryTypes } = require("sequelize");
const { sequelize, users } = require("../model");

exports.renderOrganizationForm = (req,res) => {
    res.render("addOrganization")
}

const generateRandomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000)
}

exports.createOrganization = async(req,res) => {
    const userId = req.userId;
    const user = await users.findByPk(userId)
    const organizationNumber = generateRandomNumber()
    const {organizationName , organizationPhoneNumber , organizationAddress , organizationEmail} = req.body;
    const organizationPanNumber = req.body.organizationPanNumber || null;
    const organizationVatNumber = req.body.organizationVatNumber || null;

    await sequelize.query(`CREATE TABLE organization_${organizationNumber}(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY , name VARCHAR(255) , email VARCHAR(255) , phoneNumber VARCHAR(255) , address VARCHAR(255) , panNo VARCHAR(255) , vatNo VARCHAR(255))`,{
        type : QueryTypes.CREATE
    })

    await sequelize.query(`INSERT INTO organization_${organizationNumber}(name , email , phoneNumber , address , panNo , vatNo) VALUES(?,?,?,?,?,?)`,{
        type : QueryTypes.INSERT,
        replacements : [organizationName,organizationPhoneNumber,organizationAddress,organizationEmail,organizationPanNumber,organizationVatNumber]
    })
    user.currentOrgNumber = organizationNumber;
    await user.save()
    res.send("Organization created successfully")
}