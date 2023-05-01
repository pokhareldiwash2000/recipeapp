//validation
const Joi=require('@hapi/joi');

const registerValidation =(data)=>{
    const validationSchema= Joi.object({
        name:Joi.string().min(2).max(255).required(),
        email:Joi.string().min(6).max(255).required().email(),
        password:Joi.string().min(6).required()
    });
    return validationSchema.validate(data);
}
const loginValidation =(data)=>{
    const validationSchema= Joi.object({
        email:Joi.string().min(6).max(255).required().email(),
        password:Joi.string().min(6).required()
    });
    return validationSchema.validate(data);
}
const postValidation =(data)=>{

    const validationSchema = Joi.object({
      author: Joi.string().required(),
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().min(2).max(255).required(),
      photo: Joi.any(),
      video: Joi.any(),
      youtubeURL: Joi.string().trim(),
      servings: Joi.string(),
      cookingTime: Joi.string(),
      prepTime: Joi.string(),
      ingredients: Joi.array().items(
        Joi.object({
          name: Joi.string().default(''),
          quantity: Joi.string().default('')
        }).min(1).required()
      ),
      steps: Joi.array().items(
        Joi.object({
          name: Joi.string().default(''),
          photo: Joi.string().default('')
        }).min(1).required()
      ),
      cuisinecategory: Joi.array().items(
        Joi.string().default('')
      ),
      coursecategory: Joi.array().items(
        Joi.string().default('')
      ),
      dietcategory: Joi.array().items(
        Joi.string().default('')
      )
    });
    return validationSchema.validate(data);
}
module.exports.registerValidation=registerValidation;
module.exports.loginValidation=loginValidation;
module.exports.postValidation=postValidation;