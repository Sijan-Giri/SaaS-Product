const { renderOrganizationForm } = require("../controller/organizationController");

const router = require("express").Router();

router.route("/organization").get(renderOrganizationForm);

module.exports = router