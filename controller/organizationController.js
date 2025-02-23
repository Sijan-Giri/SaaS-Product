const { QueryTypes } = require("sequelize");
const { sequelize } = require("../model");

exports.renderOrganizationForm = (req,res) => {
    res.render("addOrganization")
}

exports.createOrganization = async(req,res) => {
    const {organizationName , organizationPhoneNumber , organizationAddress , organizationEmail} = req.body;
    const organizationPanNumber = req.body.organizationPanNumber || null;
    const organizationVatNumber = req.body.organizationVatNumber || null;

    await sequelize.query(`CREATE TABLE organization(id INT NOT NULL AUTO_INCREMENT PRIMARY_KEY , name VARCHAR(255) , email VARCHAR(255) , phoneNumber VARCHAR(255) , address VARCHAR(255) , panNo VARCHAR(255) , vatNo VARCHAR(255))`,{
        type : QueryTypes.CREATE
    })

    await sequelize.query(`INSERT INTO organization(name , email , phoneNumber , address , panNo , vatNo)`)
    res.send("Organization created successfully")
}