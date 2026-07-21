const express = require("express");
const router = express.Router();

const addProductRouter = require("../AddProduct");
const updateProductRouter = require("../UpdateProduct");
const deleteProductRouter = require("../DeleteProduct");

router.use(addProductRouter);
router.use(updateProductRouter);
router.use(deleteProductRouter);

module.exports = router;