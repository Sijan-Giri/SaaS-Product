const { renderOrganizationForm, createOrganization } = require("../controller/organizationController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const router = require("express").Router();

router.route("/organization").get(renderOrganizationForm)
.post(isAuthenticated , createOrganization)

module.exports = router