import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todosTable = process.env.TODOS_TABLE
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const indexName = process.env.TodosIdIndex

const logger = createLogger('todos')

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  logger.info('Start query user todos', {
    table: todosTable,
    userId: userId
  })
  try {
    const result = await docClient.query({
      TableName: todosTable,
      IndexName: indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    if (result.Count !== 0) {
      logger.info('User Todos', {
        items: JSON.stringify(result.Items)
      })
      return result.Items as TodoItem[]
    }

    return []
  } catch (e) {
    logger.error('Get User Todos Error', {
      userId: userId,
      error: e.message
    })
  }
}

export const createTodo = async (payload: CreateTodoRequest, userId: string): Promise<TodoItem> => {
  logger.info('Create todo item', {
    payload: payload
  })
  const itemId = uuid.v4()
  const createdAt = Date.now()
  const newItem: TodoItem = {
    todoId: itemId,
    userId: userId,
    done: false,
    createdAt: createdAt.toString(),
    attachmentUrl: '',
    ...payload
  }

  try {
    await docClient.put({
      TableName: todosTable,
      Item: newItem
    }).promise()

    logger.info('Todo Item Created', {
      newItem: JSON.stringify(newItem)
    })

    return newItem
  } catch (e) {
    logger.error('Todo Create Error', {
      newItem: newItem,
      error: e.message
    })
  }
}


export const partialUpdateAttachementUrl = async (todoId: string, userId: string) => {
  try {

    logger.info('Update attachment url', { todoId: todoId })
    await docClient.update(
      {
        TableName: todosTable,
        Key: {
          todoId: todoId,
          userId: userId
        },
        UpdateExpression: `set attachmentUrl = :attachmentUrl`,
        ExpressionAttributeValues: {
          ':userId': userId,
          ':attachmentUrl': `http://${bucketName}.s3.amazonaws.com/${todoId}`
        }
      }
    ).promise()
  } catch (e) {
    logger.error('Update Url Error', { error: e.message })
  }
}

export const createAttachmentPresignedUrl = async (todoId: string) => {
  logger.info('Create Attachment Pre-signed URL', {
    todoId: todoId
  })
  return s3.getSignedUrl('PutObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}