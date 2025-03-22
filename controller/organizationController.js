const { QueryTypes } = require("sequelize");
const { sequelize, users } = require("../model");

const crypto = require('crypto');
const sendEmail = require("../services/sendEmail");

exports.renderOrganizationForm = (req, res) => {
    const {currentOrgNumber} = req.user;
    if(currentOrgNumber) {
        res.redirect("/dashboard");
        return
    }
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

        await sequelize.query(`CREATE TABLE invitations_${organizationNumber}(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY , 
        userId INT REFERENCES users(id),
        token VARCHAR(55) NOT NULL,
        created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,{
            type : QueryTypes.CREATE
        }
        )

       
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
                organizationEmail,
                organizationPhoneNumber,
                organizationAddress,
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
    const questions = await sequelize.query(`SELECT question_${organizationNumber}.*,users.username FROM question_${organizationNumber} JOIN users ON question_${organizationNumber}.userId = users.id`,{
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
    const answers = await sequelize.query(`SELECT * FROM answer_${organizationNumber} JOIN users ON users.id = answer_${organizationNumber}.userId WHERE questionId=?`,{
        type : QueryTypes.SELECT,
        replacements : [id]
    })
    const questions = await sequelize.query(`SELECT * FROM question_${organizationNumber} WHERE id=?`,{
        type : QueryTypes.SELECT,
        replacements : [id]
    })

    res.render("dashboard/singleQuestion.ejs",{questions , answers})
}

exports.answerQuestion = async(req,res) => {
    const organizationNumber = req.user.currentOrgNumber;
    const {text , questionId} = req.body;
    const userId = req.userId;
    const answerGrneyManxeKoEmail = req.user.email

    const [data] = await sequelize.query(`SELECT users.email FROM question_${organizationNumber} JOIN users ON question_${organizationNumber}.userId = users.id WHERE question_${organizationNumber}.id=? `,{
        type : QueryTypes.SELECT,
        replacements : [questionId]
    })

    const questionGrneyManxeKoEmail = data.email;

    await sendEmail({
        email : questionGrneyManxeKoEmail,
        subject : "Someone has answered to your question",
        text : `${answerGrneyManxeKoEmail} has answered to your question . Do check it out!`
    })

    await sequelize.query(`INSERT INTO answer_${organizationNumber} (userId , questionId , answer) VALUES (?,?,?)`,{
        type : QueryTypes.INSERT,
        replacements : [userId,questionId,text]
    })
    res.json({
        status : 200,
        message : "Answer sent successfully"
    })
}

exports.renderMyOrgs = async(req,res) => {
    const userId = req.userId;

    const usersOrgsNumber = await sequelize.query(`SELECT organizationNumber FROM users_org WHERE userId=?`,{
        type : QueryTypes.SELECT,
        replacements : [userId]
    })
    const orgDatas = [];
    for(var i = 0; i < usersOrgsNumber.length ; i++) {
        const [orgData] = await sequelize.query(`SELECT * FROM organization_${usersOrgsNumber[i].organizationNumber}`);
        orgDatas.push({...orgData[0],organizationNumber: usersOrgsNumber[i].organizationNumber * 1})
    }
    res.render("dashboard/myOrgs.ejs",{orgDatas})
}

exports.deleteOrganization = async(req,res) => {
    const {id : organizationNumber} = req.params;
    const currentOrg = req.user.currentOrgNumber;
    const userId = req.userId

    await sequelize.query(`DROP TABLE IF EXISTS organization_${organizationNumber}`,{
        type : QueryTypes.DELETE
    })
    await sequelize.query(`DROP TABLE IF EXISTS forum_${organizationNumber}`,{
        type : QueryTypes.DELETE
    })
    await sequelize.query(`DROP TABLE IF EXISTS answer_${organizationNumber}`,{
        type : QueryTypes.DELETE
    })
    await sequelize.query(`DELETE FROM users_org WHERE organizationNumber=?`,{
        type : QueryTypes.DELETE,
        replacements : [organizationNumber]
    })

    if(organizationNumber == currentOrg) {
        const userOrgNumber = await sequelize.query(`SELECT organizationNumber FROM users_org WHERE userId=?`,{
            type : QueryTypes.SELECT,
            replacements : [userId]
        })

        const orgLength = userOrgNumber.length;
        const previousOrg = userOrgNumber[orgLength-1];
        const user = await users.findByPk(userId)
        user.currentOrgNumber = previousOrg.organizationNumber
        await user.save()
    }
    res.redirect("/myorgs")
}

function generateToken(length=32) {
    return crypto.randomBytes(length).toString('hex')
}

exports.renderInvitePage = async(req,res) => {
    res.render("dashboard/invite.ejs");
}

exports.inviteFriends = async(req,res) => {
    const {email} = req.body;
    const currentOrg = req.user.currentOrgNumber;
    const userEmail = req.user.email;
    const userId = req.userId;

    const token = generateToken(10)

    await sequelize.query(`INSERT INTO invitations_${currentOrg}(userId , token) VALUES(?,?)`,{
        type : QueryTypes.INSERT,
        replacements : [userId,token]
    })
    await sendEmail({
        email : email,
        subject : "Invitation to join SaaS-Product Organization",
        userEmail : userEmail,
        text : `${userEmail} has invited you to join his/her organization. Click here to joinhttp://localhost:3000/accept-invite?org=${currentOrg}&token=${token}`
    })

    res.send("Invited successfully")
}

exports.acceptInvitation = async(req,res) => {
    const {token,org:orgNumber} = req.query;
    const userId = req.userId

    const [exists] = await sequelize.query(`SELECT * FROM invitations_${orgNumber} WHERE token=?`,{
        type : QueryTypes.SELECT,
        replacements : [token]
    })

    if(exists) {
        const userData = await users.findByPk(userId);
        userData.currentOrgNumber = orgNumber;
        userData.save();
        res.redirect("/dashboard");
    }
    else {
        res.send("Invalid invitations link")
    }
}

exports.deleteQuestion = async(req,res) => {
    const userId = req.userId;
    const organizationNumber = req.user.currentOrgNumber
    const {id:answerId} = req.params;

    const [answer] = await sequelize.query(`SELECT * FROM answer_${organizationNumber} WHERE id=?`,{
        type : QueryTypes.SELECT,
        replacements : [answerId]
    })
    if(!answer) {
        res.send("Answer doesn't exists with that Id");
    }else {
        if(answer.userId !== userId) {
            res.send("You don't have permission to perform this action")
        }else {
            await sequelize.query(`DELETE FROM answer_${organizationNumber} WHERE id=?`,{
                type : QueryTypes.DELETE,
                replacements : [answerId]
            })
            res.redirect("/question/" + answerId)
        }
    }
}

exports.deleteAnswer = async(req,res) => {
    
}