import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"

enum HttpStatusCode {
  SERVER_ERROR = 500
}

export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser())
}
export const handleHttpError = () => {
  return {
    statusCode: HttpStatusCode.SERVER_ERROR,
    body: 'Oops... something gone wrong'
  }
}
