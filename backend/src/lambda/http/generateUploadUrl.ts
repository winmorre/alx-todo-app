import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('uploads')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId

      let result = await createAttachmentPresignedUrl(`${todoId}`)

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 'uploadUrl': result })
      }
    } catch (e) {
      logger.error('Generate Uploads Error', {
        error: e.message
      })
    }
  }
)

handler
  .use(
    cors({
      credentials: true
    })
  )


// export const handler1 = middy(
//   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     try {
//       const todoId = event.pathParameters.todoId
//
//       let result = await imageUrl(`${todoId}.png`)
//
//       return {
//         statusCode: 200,
//         headers: {
//           'Access-Control-Allow-Headers': '*',
//           'Access-Control-Allow-Origin': '*',
//           'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
//         },
//         body: result !== undefined ? JSON.stringify({ 'uploadUrl': result,"id":todoId }):JSON.stringify({"message":"the upload Url is undefined"})
//       }
//     } catch (e) {
//       logger.error('Generate Uploads Error', {
//         error: e.message
//       })
//     }
//   }
// )
//
// handler1
//   .use(
//     cors({
//       credentials: true
//     })
//   )
