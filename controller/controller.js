const repository = require('../dbRepo/repository')
const logger = require("../utilities/logger");
var httpStatus = require('http-status-codes')
var http = require('http');
var security = require('../utilities/security')

exports.insertHandler = async (req, res) => {
    try {
        var cartDetails = req.body
        try {
            const token = req.headers[ "token" ];
            if (token){
                tokenDetails = security(token)
            }else{
                throw ("Invalid token")
            }
        }catch(err) {
            logger.info(`Error in Token authentication and Error is: ${err}`); 
            return res.status(403).json({code: 403, type: httpStatus.getStatusText(403), 
                message:"Invalid token"}) 
        }

       try{
        let productDetails = await getProduct(req.body.productID)
       }catch(err) {
        logger.info(`Error in getting product details from catalog service and Error is: ${err}`); 
        return res.status(500).json({code: 500, type: httpStatus.getStatusText(500), 
            message:"Internal Server Error, please try again after sometime"})   
    }
        cartDetails.productName = productDetails.productName
        cartDetails.subTotal = productDetails.price * cartDetails.quantity

        //insert product into shopping cart and if success, returns true 
        var flag = await repository.insertProduct(cartDetails, tokenDetails._id);
        if (flag == true) {
            res.send({ "Status": "200 OK" })
        } else {
            throw "Product already exists"
        }
    } catch (err) {
        logger.info(err)
        res.send({ "Status": "400 Product already exists Or some error" })
    }
}

exports.pingHandler = async (req, res) => {
    res.send({ "Status": "200 OK" })
}

exports.getHandler = async (req, res) => {
    try {
        try {
            const token = req.headers[ "token" ];
        if (token){
            tokenDetails = security(token)
        }else{
            throw ("Invalid token")
        }
        }catch(err) {
            logger.info(`Error in Token authentication and Error is: ${err}`); 
            return res.status(403).json({code: 403, type: httpStatus.getStatusText(403), 
                message:"Invalid token"}) 
        }
        const cartItems = await repository.getItems(tokenDetails._id)
        if (cartItems.length > 0) {
            res.send(cartItems)
        } else {
            res.send({ "404": "not found" })
        }
    } catch (err) {
        logger.info(err.stack)
        res.send(err)
    }
}

exports.deleteHandler = async (req, res) => {
    try {
        try {
            const token = req.headers[ "token" ];
            if (token){
                tokenDetails = security(token)
            }else{
                throw ("Invalid token")
            }
        }catch(err) {
            logger.info(`Error in Token authentication and Error is: ${err}`); 
            return res.status(403).json({code: 403, type: httpStatus.getStatusText(403), 
                message:"Invalid token"}) 
        }
        const deleteFlag = await repository.deleteItems(req.params.productID, tokenDetails._id)
        if (deleteFlag) {
            res.send({ "Status": "200 OK" })
        } else {
            throw "Not found"
        }
    } catch (err) {
        logger.info(err.stack)
        res.send({ "404": "Not found" })
    }
}

exports.updateQuantityHandler = async (req, res) => {
    try {
        try {
            const token = req.headers[ "token" ];
            if (token){
                tokenDetails = security(token)
            }else{
                throw ("Invalid token")
            }
        }catch(err) {
            logger.info(`Error in Token authentication and Error is: ${err}`); 
            return res.status(403).json({code: 403, type: httpStatus.getStatusText(403), 
                message:"Invalid token"}) 
        }
        try{
           let productDetails = await getProduct(req.body.productID)
        }catch(err) {
            logger.info(`Error in getting product details from catalog service and Error is: ${err}`); 
            return res.status(500).json({code: 500, type: httpStatus.getStatusText(500), 
                message:"Internal Server Error, please try again after sometime"}) 
        }
        
       
        cartProductDetails = req.body
        cartProductDetails.price = productDetails.price
        await repository.updateQuantity(tokenDetails._id, cartProductDetails)
        res.send({ "status": "200 Ok" })
    } catch (err) {
        logger.info(err.stack)
        res.send(err)
    }
}

async function getProduct(productID) {
    var price
    //Using promise as http.get doesn't return value
    await new Promise((resolve, reject) => {
        http.get('http://localhost:3002/catalog/' + productID, (resp) => {
            resp.on('data', (data) => {
                productDetails = JSON.parse(data.toString('utf8'))
                price = productDetails.price
                resolve(productDetails)
            });
        })
    });
   
}
