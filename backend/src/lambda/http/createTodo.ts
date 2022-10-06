import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('create-todo-handler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event)

      let result = await createTodo(newTodo,userId)


      return {
        statusCode:200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({"item":result})
      }
    }catch (e) {
      logger.error('Create Todo Error',{error:e.message})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
