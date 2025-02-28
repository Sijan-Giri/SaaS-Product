const { renderOrganizationForm, createOrganization, createQuestionTable, createAnswerTable, renderDashboard } = require("../controller/organizationController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const router = require("express").Router();

router.route("/organization").get(renderOrganizationForm)
.post(isAuthenticated , createOrganization , createQuestionTable , createAnswerTable)

router.route("/dashboard").get(isAuthenticated , renderDashboard)

module.exports = router