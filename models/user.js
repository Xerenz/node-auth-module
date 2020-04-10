const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        name : String,
        phone : String,
        username : String,
        password : String,

        isAdmin : {type : Boolean, default : false},
        isVerified : {type : Boolean, default : false},

        token : String,
        expires : Date
    }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);