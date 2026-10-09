const Joi = require('joi');

module.exports.listingSchema = listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
            })
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.signupSchema = Joi.object({
    username: Joi.string()
        .trim()
        .pattern(/^[A-Za-z0-9_.-]{3,30}$/)
        .required()
        .messages({
            "string.pattern.base": "Username must be 3-30 characters and use only letters, numbers, dots, dashes or underscores.",
            "string.empty": "Username is required.",
            "any.required": "Username is required.",
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .email({ minDomainSegments: 2 })
        .required()
        .messages({
            "string.email": "Please enter a valid email address.",
            "string.empty": "Email is required.",
            "any.required": "Email is required.",
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required.",
            "any.required": "Password is required.",
        }),
});