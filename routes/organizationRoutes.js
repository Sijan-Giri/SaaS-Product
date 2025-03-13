const { renderOrganizationForm, createOrganization, createQuestionTable, createAnswerTable, renderDashboard, renderForumPage, renderQuestionPage, createQuestion, renderSingleQuestion, answerQuestion, renderMyOrgs, deleteOrganization, renderInvitePage } = require("../controller/organizationController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const {multer ,  storage} = require("../middleware/multerConfig");
const uploads = multer({storage : storage})

const router = require("express").Router();

router.route("/organization").get(renderOrganizationForm)
.post(isAuthenticated , createOrganization , createQuestionTable , createAnswerTable , (req,res) => {
    res.redirect("/dashboard")
})

router.route("/dashboard").get(isAuthenticated , renderDashboard)

router.route("/forum").get(isAuthenticated , renderForumPage)

router.route("/question").get(isAuthenticated , renderQuestionPage).post(isAuthenticated , uploads.single("questionImage") , createQuestion)

router.route("/question/:id").get(isAuthenticated , renderSingleQuestion)

router.route("/answer").post(isAuthenticated,answerQuestion);

router.route("/myorgs").get(isAuthenticated , renderMyOrgs)

router.route("/organization/:id").get(isAuthenticated,deleteOrganization);

router.route("/invite").get(renderInvitePage)

module.exports = router