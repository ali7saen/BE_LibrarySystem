const Joi = require('joi');

// Base book schema
const bookBaseSchema = {

    book_id: Joi.string().uuid()
        .trim()
        .messages({
            'string.empty': 'Book ID is required'
        }),
    book_title: Joi.string()
        .min(2)
        .max(255)
        .trim()
        .messages({
            'string.min': 'Book title must be at least 2 characters long',
            'string.max': 'Book title cannot exceed 255 characters',
            'string.empty': 'Book title is required'
        }),
    book_author: Joi.string()
        .min(2)
        .max(255)
        .trim()
        .messages({
            'string.min': 'Book author must be at least 2 characters long',
            'string.max': 'Book author cannot exceed 255 characters',
            'string.empty': 'Book author is required'
        }),

    cage_id: Joi.string().uuid()
        .trim()
        .messages({
            'string.empty': 'Cage ID is required'
        }),

    shelve_id: Joi.string().uuid()
        .messages({
            'string.empty': 'Shelve ID is required'
        }),

    book_category: Joi.string()
        .messages({
            'string.empty': 'Book category is required'
        }),
    book_sequence: Joi.string()
        .messages({
            'string.empty': 'Book sequence is required'
        })
};



// Create Book DTO - for user registration
const createBookDto = Joi.object({
    book_title: bookBaseSchema.book_title.required(),
    book_author: bookBaseSchema.book_author.required(),
    book_category: bookBaseSchema.book_category.required(),
    book_sequence: bookBaseSchema.book_sequence.required(),
    cage_id: bookBaseSchema.cage_id.required(),
    shelve_id: bookBaseSchema.shelve_id.required()
});



// Update Book DTO - for user registration
const updateBookDto = Joi.object({
    book_id: bookBaseSchema.book_id.required(),
    book_title: bookBaseSchema.book_title.required(),
    book_author: bookBaseSchema.book_author.required(),
    book_category: bookBaseSchema.book_category.required(),
    book_sequence: bookBaseSchema.book_sequence.required(),
    cage_id: bookBaseSchema.cage_id.required(),
    shelve_id: bookBaseSchema.shelve_id.required()
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


class BookDto {
    constructor(data) {
        this.book_id = data.book_id;
        this.book_title = data.book_title;
        this.book_author = data.book_author;
        this.book_sequence = data.book_sequence;
        this.book_category = data.book_category;

        this.shelve_id = data.shelve_id;
        this.cage_id = data.cage_id;

        this.cage_categories = data.cage_categories? JSON.parse(data.cage_categories) : [];
        this.cage_code = data.cage_code;
        this.cage_name = data.cage_name;

        this.shelve_number = data.shelve_number;
        this.is_available = data.is_available;
        this.is_active = data.is_active;
        this.created_at = data.created_at

        this.borrowed_by = data.borrowed_by;
        this.borrowed_status = data.borrowed_status;
    }
}

class BorrowedBookDto {
    constructor(data) {
        this.book_id = data.book_id;
        this.book_title = data.book_title;
        this.book_author = data.book_author;

        this.book_category = data.book_category;

        this.shelve_id = data.shelve_id;
        this.cage_id = data.cage_id;

        this.cage_categories = JSON.parse(data.cage_categories);

        this.cage_name = data.cage_name;

        this.shelve_number = data.shelve_number;

        this.borrowed_by = data.borrowed_by;
        this.borrowed_status = data.borrowed_status;

        this.borrowed_at = data.borrowed_at;
        this.returned_at = data.returned_at;
    }
}

module.exports = {
    BookDto: BookDto,
    BorrowedBookDto: BorrowedBookDto,


    // Individual validators for easy use
    validateCreateBook: (data) => validateDto(createBookDto, data),
    validateUpdateBook: (data) => validateDto(updateBookDto, data)
}