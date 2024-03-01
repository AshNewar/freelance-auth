import Joi ,{ObjectSchema} from 'joi';

const signUpSchema: ObjectSchema = Joi.object().keys({
    username :Joi.string().min(3).max(15).required().messages({
        'string.base':'username should be a type of string',
        'string.empty':'username cannot be empty',
        'string.min':'username should have a minimum length of {#limit}',
        'string.max':'username should have a maximum length of {#limit}',
        'any.required':'username is a required field',
    }),
    password :Joi.string().min(8).max(15).required().messages({
        'string.base':'password should be a type of string',
        'string.empty':'password cannot be empty',
        'string.min':'password should have a minimum length of {#limit}',
        'string.max':'password should have a maximum length of {#limit}',
        'any.required':'password is a required field',
    }),
    country: Joi.string().min(3).max(15).required().messages({
        'string.base':'country should be a type of string',
        'string.empty':'country cannot be empty',
        'string.min':'country should have a minimum length of {#limit}',
        'string.max':'country should have a maximum length of {#limit}',
        'any.required':'country is a required field',
    }),
    email : Joi.string().email().required().messages({
        'string.base':'email should be a type of string',
        'string.empty':'email cannot be empty',
        'string.email':'email should be a valid email',
        'any.required':'email is a required field',
    }),
    profilePicture: Joi.string().required().messages({
        'string.base':'profilePicture should be a type of string',
        'string.empty':'profilePicture cannot be empty',
        'any.required':'profilePicture is a required field',
    })

});

export  {signUpSchema};