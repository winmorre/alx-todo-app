import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as createError from 'http-errors'


const logger = createLogger("todos")

const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()


export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  try{
    return await todosAccess.getTodosForUser(userId)
  }catch (e) {
    logger.error("Get User Todos Error",{
      userId: userId,
      error: e.message
    })
    throw new createError.BadRequest('Get user todo error')
  }
}

export const createTodo = async (payload: CreateTodoRequest, userId: string): Promise<TodoItem> => {
  try{
    return await todosAccess.createTodo(payload, userId)
  }catch (e) {
    logger.error('Todo Create Error',{
      error: e.message
    })
  }
}

export const updateTodo = async (payload: UpdateTodoRequest, todoId: string,userId:string): Promise<number> => {
  logger.info('Update User todo',{
    todoId: todoId
  })
  try {
    return await todosAccess.updateTodo(payload,userId,todoId)
  }catch (e) {
    logger.error('Todo Update Error',{
      todoId:todoId,
      payload: JSON.stringify(payload),
      error: e.message
    })
  }

}


export const deleteTodo = async (todoId: string,userId:string)=>{
  try{
    return await todosAccess.deleteTodo(todoId,userId)
  }catch (e) {
    logger.error('Todo Delete Error',{
      todoId: todoId,
      error: e.message
    })
  }
}

export const createAttachmentPresignedUrl = async  (todoId:string)=>{
  logger.info("Create Attachment Pre-signed URL",{
    todoId:todoId
  })
  return await attachmentUtils.createAttachmentPresignedUrl(todoId)
}