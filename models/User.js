const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');

const { isEmail } = require('validator');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please chose a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    }
});

// fire a function after doc saved to db
userSchema.post('save', (doc, next) => {
    console.log('new use was created and saved', doc)
    next();
})

// fire a function before doc saved to db
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// static method to login user
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({ email }); // like email:email because they both have the same name
    if(user){
        const auth = await bcrypt.compare(password, user.password); // We compare the two hash password (return true if ok)
        if (auth){
            return user; // We return the user we found in the DB
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email')
}
const User = mongoose.model('user', userSchema);

module.exports = User;