const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userName = users.find(user => user.username === username);
  
  if(!userName) {
    return response.status(400).json({error: "Customer alreay exists!"})
  }

  request.userName = userName;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username} = request.body;

  const userAlreadyConsists = users.find(user => user.username === username);

  if(userAlreadyConsists) {
    return response.status(400).json({error : 'User already exists'});
  }

  const user = { 
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  }
 
  users.push(user);

  return response.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos);
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;

    const todo = { 
    	id: uuidv4(), 
    	title,
    	done: false, 
    	deadline: new Date(deadline), 
    	created_at: new Date()
    }

    user.todos.push(todo);
    return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Not Exist this user"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Not Exist this user"})
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex(todo => todo.id === id);

  if(todo === -1) {
    return response.status(404).json({error: "Not Exist this user"})
  }

  user.todos.splice(todo, 1);

  return response.status(204).json();
});

module.exports = app;