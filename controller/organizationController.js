const { QueryTypes } = require("sequelize");
const { sequelize, users } = require("../model");

exports.renderOrganizationForm = (req, res) => {
    res.render("addOrganization");
};

const generateRandomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

exports.createOrganization = async (req, res , next) => {
    try {
        const userId = req.userId;
        const user = await users.findByPk(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const organizationNumber = generateRandomNumber();
        const { organizationName, organizationPhoneNumber, organizationAddress, organizationEmail } = req.body;

        if (!organizationName || !organizationPhoneNumber || !organizationAddress || !organizationEmail) {
            return res.send("Please fill all the required field")
        }
        const organizationPanNumber = req.body.organizationPanNumber || null;
        const organizationVatNumber = req.body.organizationVatNumber || null;

       
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users_org (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                userId INT,  -- Column definition
                organizationNumber VARCHAR(255),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE  -- Foreign key constraint
            );
        `, {
            type: QueryTypes.RAW,
        });

       
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS organization_${organizationNumber} (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                phoneNumber VARCHAR(255),
                address VARCHAR(255),
                panNo VARCHAR(255),
                vatNo VARCHAR(255)
            );
        `, {
            type: QueryTypes.RAW,
        });

        
        await sequelize.query(`
            INSERT INTO organization_${organizationNumber} 
            (name, email, phoneNumber, address, panNo, vatNo) 
            VALUES (?, ?, ?, ?, ?, ?);
        `, {
            type: QueryTypes.RAW,
            replacements: [
                organizationName,
                organizationPhoneNumber,
                organizationAddress,
                organizationEmail,
                organizationPanNumber,
                organizationVatNumber,
            ],
        });

        
        await sequelize.query(`
            INSERT INTO users_org (userId, organizationNumber) 
            VALUES (?, ?);
        `, {
            type: QueryTypes.RAW,
            replacements: [userId, organizationNumber],
        });

        
        user.currentOrgNumber = organizationNumber;
        await user.save();
        req.organizationNumber = organizationNumber;
        next()
        return;
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while creating the organization");
    }
};

exports.createQuestionTable = async(req,res,next) => {
    const organizationNumber = req.organizationNumber
    await sequelize.query(`CREATE TABLE question_${organizationNumber}(
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT , 
        title VARCHAR(255) ,
        description TEXT,
        questionImage VARCHAR(255),
        userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,{
            type : QueryTypes.CREATE
        })
        next()
}

exports.createAnswerTable = async(req,res) => {
    const organizationNumber = req.organizationNumber;
    await sequelize.query(`CREATE TABLE answer_${organizationNumber}(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        answer TEXT,
        userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        questionId INT NOT NULL REFERENCES question(id),
        created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,{
            type : QueryTypes.CREATE
        })
        res.redirect("/dashboard")
}

exports.renderDashboard = (req,res) => {
    res.render("dashboard/index.ejs")
} 

exports.renderForumPage = async(req,res) => {
    const organizationNumber = req.user.currentOrgNumber;
    const questions = await sequelize.query(`SELECT * FROM question_${organizationNumber}`,{
        type : QueryTypes.SELECT
    })
    res.render("dashboard/forum.ejs",{questions : questions})
}

exports.renderQuestionPage = (req,res) => {
    res.render("dashboard/askQuestion.ejs")
}

exports.createQuestion = async (req,res) => {
    const organizationNumber = req.user.currentOrgNumber;
    const userId = req.userId
    const {title , description} = req.body;
    const file = req.file
    if(!title || !description) {
        return res.send("Please provide title & description")
    }
    
    await sequelize.query(`INSERT INTO question_${organizationNumber} (title , description , userId , questionImage) VALUES(?,?,?,?)`,{
        type : QueryTypes.INSERT,
        replacements : [title , description , userId ,file && file.filename || "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500"]
    })
    res.redirect("/forum")
}

exports.renderSingleQuestion = async(req,res) => {
    const {id} = req.params;
    const organizationNumber = req.user.currentOrgNumber;
    const question = await sequelize.query(`SELECT * FROM question_${organizationNumber} WHERE id=?`,{
        type : QueryTypes.SELECT,
        replacements : [id]
    })
    res.render("dashboard/singleQuestion.ejs",{question})
}