const express = require('express');
const router = express.Router();
const centres = require('../controllers/centres');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCentre } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Centre = require('../models/centre');

router.route('/')
    .get(catchAsync(centres.index))
    .post(isLoggedIn, upload.array('image'), validateCentre, catchAsync(centres.createCentre))


router.get('/new', isLoggedIn, centres.renderNewForm)

router.route('/:id')
    .get(catchAsync(centres.showCentre))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCentre, catchAsync(centres.updateCentre))
    .delete(isLoggedIn, isAuthor, catchAsync(centres.deleteCentre));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(centres.renderEditForm))



module.exports = router;