const express = require('express');
const router = express.Router();
const controller = require('../controllers/shippingController');

// Simple DB ping for debugging
router.get('/test', controller.ping);

// Expecting user_id passed as query param for GET and in body for POST/PUT
router.get('/', controller.getAddresses);
router.post('/', controller.createAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;
