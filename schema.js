const Joi = require('joi');
const { join } = require('path');
const { count } = require('random-words');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().allow('').uri(),
      filename: Joi.string().allow('')
    }).optional(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    // Add the category field to the schema
    category: Joi.string().required(),
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required()
});