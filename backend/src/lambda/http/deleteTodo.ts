import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('delete-todo-handler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      logger.info('Delete todo', { id: todoId })

      const userId = getUserId(event)
      const result = await deleteTodo(todoId,userId)

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 'id': result })
      }
    } catch (e) {
      logger.error('Todo Delete Error', { error: e.message })
    }
  }
)

handler
  .use(
    cors({
      credentials: true
    })
  )
