const UserDAL = require("../../DAL/userDAL");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const Joi = require('joi');

//Validation schema
const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('CONTENT_MANAGER', 'VIEWER').required()
})
class AuthService {

    static async register (req) {
        try {
            const { error, value } = userSchema.validate(req.body, { abortEarly: false });

            if (error) {
                throw { 
                    statusCode: 400, 
                    message: error.details.map(d => d.message).join(', '),
                    data: {}
                };
            }

            const { name, email, password, role } = value;

            const user = await UserDAL.findUserByWhere({ email });

            if (user) {
                throw { statusCode: 400, message: "User with this email already exists." }
            }

             // Hash password with bcrypt (salt factor 12)
            const passwordHash = await bcrypt.hash(password, 12);

            const userData = {
                name,
                email,
                passwordHash,
                role,
            };

            const newUser = await UserDAL.createUser(userData);

            // Return user data excluding passwordHash
            const { passwordHash: _, ...userWithoutPassword } = newUser.toJSON();

            return userWithoutPassword;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async login (req) {
        try {
            const { email, password } = req.body;

            // Validate email and password are provided
            if (!email || !password) {
                throw {
                statusCode: 400,
                message: 'Email and password are required'
                };
            }

            // Retrieve user by email via UserDAL
            const user = await UserDAL.findUserByWhere({email});

            // Check if user exists and password matches
            // Use consistent error message for both cases to prevent email enumeration
            if (!user) {
                throw {
                statusCode: 401,
                message: 'Invalid credentials'
                };
            }

             // Compare provided password with stored hash using bcrypt
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

            if (!isPasswordValid) {
                throw {
                statusCode: 401,
                message: 'Invalid credentials'
                };
            }

            // Generate JWT token with user ID, email, role and storeId claims
            const token = jwt.sign(
                { 
                id: user.id,
                email: user.email, 
                role: user.role,
                name: user.name
                },
                process.env.JWT_SECRET,
                { 
                expiresIn: process.env.TOKEN_EXPIRY 
                }
            );

            // Return access token and user data (excluding passwordHash)
            const { passwordHash: _, ...userWithoutPassword } = user.toJSON();

            return {
                access_token: token,
                user: userWithoutPassword
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}

module.exports = AuthService;