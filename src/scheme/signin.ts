import Joi , {ObjectSchema} from 'joi';

const signInSchema: ObjectSchema = Joi.object().keys({
    username : Joi.alternatives().conditional(Joi.string().email(),{
        then:Joi.string().email().required().messages({
        'string.base':'email should be a type of string',
        'string.empty':'email cannot be empty',
        'string.email':'email should be a valid email',
        }),
        otherwise:Joi.string().min(3).max(15).required().messages({
            'string.base':'username should be a type of string',
            'string.empty':'username cannot be empty',
            'string.min':'username should have a minimum length of {#limit}',
            'string.max':'username should have a maximum length of {#limit}',
            'any.required':'username is a required field',
        })
    }),
    password :Joi.string().min(8).max(15).required().messages({
        'string.base':'password should be a type of string',
        'string.empty':'password cannot be empty',
        'string.min':'password should have a minimum length of {#limit}',
        'string.max':'password should have a maximum length of {#limit}',
        'any.required':'password is a required field',
    })
});

export {signInSchema};