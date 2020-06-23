const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const nextId = require("./next-id");
const { sortTodoLists, sortTodos } = require("./sort");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  loadTodoList(todoListId) {
    let todoList = this._findTodoList(todoListId);
    return deepCopy(todoList);
  }

  loadTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  }

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  isUniqueConstraintViolation(_error) {
    return false;
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  toggleDoneTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (!todo) return undefined;

    todo.done = !todo.done;
    return true;
  }

  deleteTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    let todoIndex = todoList.todos.findIndex(todo => todo.id === todoId)
    if (todoIndex === -1) return false;
    
    todoList.todos.splice(todoIndex, 1);
    return true;
  }

  createTodo(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    let newTodo = {
        id: nextId(),
        title,
        done: false,
      };

    todoList.todos.push(newTodo);
  }

  completeAllDone(todoListId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;

    todoList.todos.forEach(todo => todo.done = true);
    return true;
  }

  existsTodoListTitle(todoListTitle) {
    return this._todoLists.some(todoList => todoList.title === todoListTitle);
  }

  setTodoListTitle(todoListId, todoListTitle) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;

    todoList.title = todoListTitle;
    return true;
  }

  deleteTodoList(todoListId) {
    let index = this._todoLists.findIndex(todoList => todoList.id === todoListId);
    if (index === -1) return undefined;

    this._todoLists.splice(index, 1);
    return true;
  }

  createTodoList(title) {
    this._todoLists.push({
      id: nextId(),
      title,
      todos: [],
    });

    return true;
  }

  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undone, done);
  }

  sortedTodos(todoList) {
    let todos = todoList.todos;
    let undone = todos.filter(todo => !todo.done);
    let done = todos.filter(todo => todo.done);
    return deepCopy(sortTodos(undone, done));
  }

  _findTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;

    return todoList.todos.find(todo => todo.id === todoId);
  }

  _findTodoList(todoListId) {
    return this._todoLists.find(todoList => todoList.id === todoListId);
  }
};