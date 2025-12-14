const UserDAL = require('../DAL/userDAL');
const jwt = require('jsonwebtoken');

module.exports = async function(req,res,next){
    try {
        // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          statusCode: 401,
          status: 0,
          message: 'Authorization header is required',
          data: {}
        });
      }

      // Check if header follows "Bearer <token>" format
      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({
          statusCode: 401,
          status: 0,
          message: 'Authorization header must be in format: Bearer <token>',
          data: {}
        });
      }

      const token = tokenParts[1];

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        let message = 'Invalid token';
        
        if (jwtError.name === 'TokenExpiredError') {
          message = 'Token has expired';
        } else if (jwtError.name === 'JsonWebTokenError') {
          message = 'Invalid token format';
        }

        return res.status(401).json({
          statusCode: 401,
          status: 0,
          message,
          data: {}
        });
      }

      // Validate that token contains required user information
      if (!decoded.id || !decoded.email) {
        return res.status(401).json({
          statusCode: 401,
          status: 0,
          message: 'Invalid token payload',
          data: {}
        });
      }

      // Verify user still exists in database
      const user = await UserDAL.findUserByWhere({id: decoded.id});
      if (!user) {
        return res.status(401).json({
          statusCode: 401,
          status: 0,
          message: 'User not found',
          data: {}
        });
      }

      // Verify email matches (in case user email was changed)
      if (user.email !== decoded.email) {
        return res.status(401).json({
          statusCode: 401,
          status: 0,
          message: 'Token is no longer valid',
          data: {}
        });
      }

      // Attach authenticated user information to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      // Continue to next middleware/route handler
      next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            statusCode: 500,
            status: 0,
            message: 'Internal server error during authentication',
            data: {}
        });
    }
}