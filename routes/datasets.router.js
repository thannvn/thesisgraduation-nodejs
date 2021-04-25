const express = require('express');
const multer = require('multer');
const { auth } = require('../common/verify-token');
const { ownerDataset } = require('../common/verify-owner');
const datasetController = require('../controllers/dataset.controller');
const util = require('util');
const { validate } = require('../common/validation-dataset');
const {
  uploadDataset,
  updateVersion,
} = require('../models/dataset-files-storage');
const uploadImage = require('../models/image-storage');
const router = express.Router();

/*
Upload multiple file in dataset by multer
*/
router.post(
  '/new-dataset',
  auth,
  async (req, res, next) => {
    try {
      const upload = util.promisify(uploadDataset);
      await upload(req, res);
      next();
    } catch (error) {
      if (error instanceof multer.MulterError || error) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ message: error.message });
      }
    }
  },
  validate.validateDataset(),
  datasetController.createDataset
);

/* Update description dataset */
router.post(
  '/update/description',
  auth,
  ownerDataset,
  datasetController.updateDatasetDescription
);

/* Update tags dataset */
router.post(
  '/update/tags',
  auth,
  ownerDataset,
  datasetController.updateDatasetTags
);

/* Update visibility dataset */
router.post(
  '/update/visibility',
  auth,
  ownerDataset,
  datasetController.updateDatasetVisibility
);

/* Update title and subtitle dataset */
router.post(
  '/update/title-subtitle',
  auth,
  ownerDataset,
  validate.validateTitleAndSubtitle(),
  datasetController.updateDatasetTitleAndSubtitle
);

/* Update banner dataset */
router.post(
  '/update/banner',
  auth,
  async (req, res, next) => {
    try {
      const upload = util.promisify(uploadImage);
      await upload(req, res);
      next();
    } catch (error) {
      if (error instanceof multer.MulterError || error) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ message: error.message });
      }
    }
  },
  datasetController.updateDatasetBanner
);

/* Update banner dataset */
router.post(
  '/update/thumbnail',
  auth,
  async (req, res, next) => {
    try {
      const upload = util.promisify(uploadImage);
      await upload(req, res);
      next();
    } catch (error) {
      if (error instanceof multer.MulterError || error) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ message: error.message });
      }
    }
  },
  datasetController.updateDatasetThumbnail
);

/* Get all tags */
router.get('/all-tags', auth, datasetController.findAllTags);

/* Get trending dataset  */
router.get('/trending', auth, datasetController.findTrendingDataset);

/* Search dataset by filter  */
router.post('/search', auth, datasetController.searchDataset);

/* Like dataset  */
router.post('/like', auth, datasetController.likeOrUnLikeDataset);

/* Get dataset info */
router.get('/:username/:url', auth, datasetController.getOneDataset);

/* Download dataset */
router.post('/download', auth, datasetController.downloadDataset);

/*Update version dataset */
router.post(
  '/new-version',
  auth,
  function (req, res, next) {
    req.fileModifies = new Map();
    next();
  },
  async (req, res, next) => {
    try {
      const upload = util.promisify(updateVersion);
      await upload(req, res);
      next();
    } catch (error) {
      if (error instanceof multer.MulterError || error) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ message: error.message });
      }
    }
  },
  datasetController.createNewVersion
);

module.exports = router;
