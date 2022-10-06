import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createTodo, getTodosForUser } from '../businessLogic/todos'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'



const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

 function createDynamoDbClient() {
  if (process.env.IS_OFFLINE){
    logger.info('Creating a local dynamoDb instance')
    // @ts-ignore
    return  new XAWS.DynamoDB.DocumentClient({
      region:"localhost",
      endpoint:"https://localhost:8000"
    })

  }
  // @ts-ignore
   return  new XAWS.DynamoDB.DocumentClient()
}


export class TodosAccess{
  constructor(private  readonly docClient:DocumentClient=createDynamoDbClient(),
              private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getTodosForUser(userId:string):Promise<TodoItem[]>{
    return await getTodosForUser(userId)
  }

  async createTodo(payload: CreateTodoRequest, userId: string):Promise<TodoItem>{
    return await createTodo(payload, userId)
  }

  async updateTodo(payload:TodoUpdate,userId:string,todoId:string):Promise<number>{
    await this.docClient.update(
      {
        TableName: this.todosTable,
        Key: {
          todoId: todoId
        },
        UpdateExpression: `set name = :name,done=:done,dueDate=:dueDate`,
        ExpressionAttributeValues: {
          ':name': payload.name,
          ':done': payload.done,
          ':dueDate': payload.dueDate,
          ':userId':userId
        },
        ConditionExpression: `userId = :userId`
      }
    ).promise()

    return 200
  }

  async deleteTodo(todoId: string,userId:string):Promise<number>{
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      ExpressionAttributeValues: {
        ':userId':userId
      },
      ConditionExpression: `userId = :userId`
    }).promise()
    return 200
  }
}