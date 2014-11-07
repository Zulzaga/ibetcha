// to use: just add to routes file: var utils = require('../utils/utils')
//note: .. is to go 1 level down

var utils = {};

// Send a 200 SUCCESS code with success:true in the request body to the response argument
// provided. The caller of this function should return after calling.
utils.sendSuccessResponse = function(res, content) {
    res.status(200).json({
        success: true,
        content: content
    }).end();
};

// Send an error code with success:false and error message as provided in the
// arguments to the response argument provided. The caller of this function
// should return after calling.
utils.sendErrResponse = function(res, errcode, err) {
    res.status(errcode).json({
        success: false,
        err: err
    }).end();
};

// Temporary:
// Middleware function that sends an error if the user is not logged in.
// We might not be using this right now, but can be modified to use TOKENs as required
utils.requireLogin = function(req, res, next) {
    if (!req.session.username) {
        utils.sendErrResponse(res, 403,
                'You must be logged in to perform this action');
    } else {
        next();
    }
}
module.exports = utils;