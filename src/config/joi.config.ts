import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
});
