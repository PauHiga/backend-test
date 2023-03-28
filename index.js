require('dotenv').config()

const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}


morgan.token('dataSent', function (req) { return JSON.stringify(req.body)})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :dataSent', 'immediate'))
app.use(requestLogger)


app.get('/api/persons',(request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id',(request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {response.json(person)})
    .catch(error => next(error))
})

app.get('/info/',(request, response) => {
  const date = new Date()
  Person.find({}).then(persons => {
    response.send(`The Phonebook has info for ${persons.length} persons <br>
    ${date}`)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(() => {response.status(204).end()}).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then( () => {
    console.log('Person saved!')
    response.json(newPerson)
  }).catch( error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new:true, runValidators:true, context:'query' } ).then(updatedPerson => {response.json(updatedPerson)}).catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error:'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError'){
    return response.status(400).send({ error:'malformed id' })
  }
  else if (error.name ==='ValidationError'){
    return response.status(400).json({ error:error.message })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {console.log(`server running on port ${PORT}`)})