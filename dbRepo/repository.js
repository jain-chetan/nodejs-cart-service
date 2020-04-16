const mongoose = require('mongoose')
mongoose.set('debug', true)
const Cart = mongoose.model("Cart")

const insertProduct = async (data, userID) => {

    var exists = await getProduct(userID, data.productID)
    if (exists) {
        return false
    }
    await Cart.updateOne({ "userID": userID }, { "$push": { "products": data } });
    await updateGrandTotal(userID)
    return true
}

async function getProduct(userID, productID) {
    var existFlag = false
    var product = await Cart.find({ 'userID': userID, 'products.productID': productID }, { 'products': 0 })
    if (product.length > 0) {
        existFlag = true
    }
    return existFlag
}

const getItems = (userID) => {
    var items = Cart.find({ "userID": userID })
    return items
}

const deleteItems = async (productID, userID) => {
    if (await getProduct(userID, productID)) {
        await Cart.updateOne({ "userID": userID }, { "$pull": { products: { "productID": productID } } })
        updateGrandTotal(userID)
        return true
    }
    return false
}

const updateQuantity = async (userID, data) => {
    console.log(data.price)
    await Cart.updateOne({ "userID": userID, "products.productID": data.productID }, { $set: { "products.$.quantity": data.quantity, 
    "products.$.subTotal": data.quantity * data.price } })
    await updateGrandTotal(userID)
}

const updateGrandTotal = async (id) => {
    var total = await Cart.aggregate([{ $match: { userID: (id) } }, { $project: { "grandTotal": { "$sum": "$products.subTotal" } } }]).exec();
    const gt = total[0].grandTotal
    if ((total.length) > 0) {
        await Cart.updateOne({ userID: id }, { $set: { "grandTotal": gt } });
        return total[0].grandTotal
    } else {
        return 0
    }
}

function authenticateUser(email, password){
    const user = User.findOne({"email":email, "password":password, "IsDeleted":false}, {"email":1, "password":1, "role":1})
    return user
}

module.exports = {authenticateUser, insertProduct, getItems, deleteItems, updateGrandTotal, updateQuantity }