require('dotenv').config()

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)
.then(console.log("connected to", url))
.catch(error =>{console.log('There was an error connecting with MongoDB', error)})

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength:3,
      required:true 
    },
    number: {
      type:String,
      validate:{
        validator:function(v){
          return /\d{2}-\d{5,}|\d{3}-\d{4,}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      required:true
    },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
  returnedObject.id = returnedObject._id.toString()
  delete returnedObject._id
  delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)