const express = require('express');
const router = express.Router();
const { verifyInternalKey } = require('../middleware/auth');
const jobController = require('../controllers/internal/jobController');

router.post('/jobs/review-pull', verifyInternalKey, jobController.runReviewPull);
router.post('/jobs/report-build', verifyInternalKey, jobController.runReportBuild);
router.post('/jobs/renewal-check', verifyInternalKey, jobController.runRenewalCheck);

module.exports = router;
