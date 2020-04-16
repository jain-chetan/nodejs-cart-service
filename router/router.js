require('../model/model');
const controller = require('../controller/controller');

const express = require('express')
const router = express.Router();

router.get("/ping", controller.pingHandler)
router.get("/", controller.getHandler)

router.delete("/:productID", controller.deleteHandler)
router.put("/", controller.insertHandler)
router.put("/updateQuantity", controller.updateQuantityHandler)

module.exports = router;
