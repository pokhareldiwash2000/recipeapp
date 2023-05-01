const { string } = require("@hapi/joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema= new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    name:{
        type: String,
        required:true,
        trim: true,
        min:2,
        max:255
    },
    description:{
        type: String,
        required:true,
        trim: true,
        min:2,
        max:255
    },
    photo:{
        type:String,
        default:''
    },
    video:{
        type:String,
        default:''
    },
    youtubeURL:{
        type:String,
        default:'',
        trim: true,
    },
    servings:{
        type:String,
        default:''
    },
    cookingTime:{
        type:String,
        default:''
    },
    prepTime:{
        type:String,
        default:''
    },
    ingredients: [{
        name: { type: String, default:'' },
        quantity: { type: String,default:'' }
    }],
    steps: [{
        name: { type: String ,default:''},
        photo: { type: String,default:'' }
    }],
    cuisinecategory:[{
        type:String,
        default:'',
        // enum: [ 'none','North Indian', 'South Indian', 'Chinese', 'Asian', 'Italian', 'Mughlai', 'American', 'Punjabi', 'Mediterranean', 'Mexican', 'Gujarati', 'Fusion', 'Thai', 'Sattvik', 'Maharashtrian', 'Rajasthani', 'Malabar Cuisine', 'Bengali', 'Bihari', 'Konkani', 'Goan', 'Kashmiri', 'Vietnamese', 'Middle Eastern', 'Parsi', 'French', 'Australian' ], 
    }],
    coursecategory:[{
        type:String,
        default:'',
        // enum:[ 'none','Soups & Stews', 'Appetizers', 'Salads', 'Dip', 'Side Dishes', 'Mains', 'Dessert', 'Cake', 'Breakfast', 'Brunch', 'Lunch', 'Tiffin', 'Snacks', 'High Tea', 'Sandwiches & Wraps', 'Chaat', 'Dinner', 'Kids' ]
    }],
    dietcategory:[{
        type:String,
        default:'',
        // enum: [ 'none','Low Cal', 'Gluten Free', 'Diabetic', 'Low Carb', 'Low Cholestrol', 'Weight Loss', 'Balanced Diet', 'Zero Oil', 'Low Sodium', 'High Fiber', 'Pregnancy', 'Nursing', 'High Protein', 'Dairy Free', 'Tree Nut Free' ]
     }],
    totalreviews: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    totalreviewscore: { type: Number, default: 0 },
    date:{type:Date,default:Date.now},
    rating: {type: Number,default: 1}

});

postSchema.methods.calculateRating = function() {
    const totalreviewscore = this.totalreviewscore;
    const totalreviews = this.totalreviews;
    if(totalreviews==0 || totalreviewscore==0){
        this.rating=1
    }
    else{
        this.rating = 1+(totalreviewscore/totalreviews);
    }
  }
  
  postSchema.pre('save', function(next) {
    this.calculateRating();
    next();
  });
module.exports= mongoose.model('Post',postSchema);
