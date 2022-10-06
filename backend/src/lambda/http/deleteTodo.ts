import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete-todo-handler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
   try{
     const todoId = event.pathParameters.todoId

     const userId = getUserId(event)
     await deleteTodo(todoId,userId)

     return {
       statusCode: 200,
       headers: { 'Access-Control-Allow-Origin': '*' },
       body: JSON.stringify({})
     }
   }catch (e) {
     logger.error('Todo Delete Error',{error:e.message})
   }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
