const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) =>{
  response.status(404).send({error:'unknown endpoint'})
}

morgan.token('dataSent', function (req, res) { return JSON.stringify(req.body)})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :dataSent', 'immediate'))
app.use(requestLogger)

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(request, response)=>{
    response.json(persons)
})

app.get('/api/persons/:id',(request, response)=>{
  const id = Number(request.params.id)
  const person = persons.find(item =>item.id === id)
  if (person){
    response.json(person)
  }
  else{
    response.status(404).end(`Cannot GET /api/persons/${id}`)
  }  
})

app.get('/info/',(request, response)=>{
    const date = new Date()
    response.send(`The Phonebook has info for ${persons.length} persons <br>
    ${date}`)
})

app.delete('/api/persons/:id', (request, response)=>{
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response)=>{
  const body = request.body
  
  if (!body){
      return response.status(404).json({error:'content missing'})
  }
  else if (!body.number){
    return response.status(404).json({error:'number missing'})
  }
  else if (!body.name){
      return response.status(404).json({error:'name missing'})
  }
  else if (persons.find(item => item.name === body.name)){
      return response.status(404).json({error:'the name must be unique'})
  }

  const randomId = Math.round(Math.random() * 10000)
  
    const newPerson = {
        id: randomId,
        name: body.name,
        number: body.number
    }

  console.log(newPerson)

  persons = persons.concat(newPerson)
  response.json(newPerson)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> {console.log(`server running on port ${PORT}`)})