// dto/userDto.js
const Joi = require('joi');

// Base user schema
const userBaseSchema = {

    username: Joi.string()
        .min(3)
        .max(30)
        .trim()
        .messages({
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username cannot exceed 30 characters',
            'string.empty': 'Username is required'
        }),

    first_name: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name cannot exceed 100 characters',
            'string.empty': 'First name is required'
        }),

    last_name: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name cannot exceed 100 characters',
            'string.empty': 'Last name is required'
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.empty': 'Password is required'
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': 'Password confirmation does not match password',
            'string.empty': 'Password confirmation is required'
        })
};

// Create User DTO - for user registration
const createUserDto = Joi.object({
    username: userBaseSchema.username.required(),
    first_name: userBaseSchema.first_name.required(),
    last_name: userBaseSchema.last_name.required(),
    password: userBaseSchema.password.required(),
    confirmPassword: userBaseSchema.confirmPassword.required()
});

// Update User DTO - for user profile updates (password not required)
const updateUserDto = Joi.object({
    username: userBaseSchema.username,
    first_name: userBaseSchema.first_name,
    last_name: userBaseSchema.last_name
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

// Login DTO
const loginDto = Joi.object({
    username: userBaseSchema.username.required(),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});

// Change Password DTO
const changePasswordDto = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Current password is required'
    }),
    newPassword: userBaseSchema.password.required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Password confirmation does not match new password',
            'string.empty': 'Password confirmation is required'
        })
});

// Reset Password DTO
const resetPasswordDto = Joi.object({
    newPassword: userBaseSchema.password.required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Password confirmation does not match new password',
            'string.empty': 'Password confirmation is required'
        })
});


// Query Parameters DTO for listing users
const getUsersQueryDto = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().max(255),
    status: Joi.string().valid('active', 'inactive'),
    sortBy: Joi.string().valid('name', 'email', 'createdAt', 'updatedAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// User ID DTO for operations requiring user ID (UUID/uniqueidentifier)
const userIdDto = Joi.object({
    user_id: Joi.string()
        .guid({ version: ['uuidv4', 'uuidv5'] })
        .required()
        .messages({
            'string.guid': 'User ID must be a valid UUID',
            'string.empty': 'User ID is required',
            'any.required': 'User ID is required'
        })
});

// Validation function
const validateDto = (schema, data, options = {}) => {
    const defaultOptions = {
        abortEarly: false,
        stripUnknown: true,
        ...options
    };

    const { error, value } = schema.validate(data, defaultOptions);

    if (error) {
        const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));

        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = validationErrors;
        throw err;
    }

    return value;
};

class UserDto {
    constructor(data) {
        this.user_id = data.user_id;
        this.username = data.username;
        this.full_name = data.first_name + " " + data.last_name;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}


module.exports = {
    // Schemas
    createUserDto,
    updateUserDto,
    loginDto,
    changePasswordDto,
    resetPasswordDto,
    getUsersQueryDto,
    userIdDto,

    // Validation function
    validateDto,

    // Individual validators for easy use
    validateCreateUser: (data) => validateDto(createUserDto, data),
    validateUpdateUser: (data) => validateDto(updateUserDto, data),
    validateLogin: (data) => validateDto(loginDto, data),
    validateChangePassword: (data) => validateDto(changePasswordDto, data),
    validateResetPassword: (data) => validateDto(resetPasswordDto, data),
    validateGetUsersQuery: (data) => validateDto(getUsersQueryDto, data),
    validateUserId: (data) => validateDto(userIdDto, data),
    UserDto : UserDto
};