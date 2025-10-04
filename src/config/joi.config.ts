import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  ZOOM_URL: Joi.string().uri().required(),
  ZOOM_ACCOUNT_ID: Joi.string().required(),
  ZOOM_CLIENT_ID: Joi.string().required(),
  ZOOM_CLIENT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000),
  CLOUDINARY_SECRET: Joi.string().required(),
  CLOUDINARY_KEY: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  IS_SEED_EXECUTED: Joi.boolean().default(false),
});
