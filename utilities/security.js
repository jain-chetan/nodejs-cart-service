const jwt = require( "jsonwebtoken" );
const config = require('../config/config');
const repository = require('../dbRepo/repository')

module.exports = function( token) {
    if (token == null) throw "No token present"

    
        jwt.verify( token, config.secretKey, function( err, decoded ) {
            if ( err ) {
                console.log( err );
                throw(err)
            }
            tokenDetails = decoded
           console.log(tokenDetails)
        } )
    return tokenDetails
};