const { renderOrganizationForm, createOrganization, createQuestionTable, createAnswerTable, renderDashboard, renderForumPage, renderQuestionPage, createQuestion } = require("../controller/organizationController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const router = require("express").Router();

router.route("/organization").get(renderOrganizationForm)
.post(isAuthenticated , createOrganization , createQuestionTable , createAnswerTable , (req,res) => {
    res.redirect("/dashboard")
})

router.route("/dashboard").get(isAuthenticated , renderDashboard)

router.route("/forum").get(isAuthenticated , renderForumPage)

router.route("/question").get(isAuthenticated , renderQuestionPage).post(isAuthenticated , createQuestion)

module.exports = router