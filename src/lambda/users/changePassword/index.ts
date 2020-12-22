import {
   APIGatewayProxyEvent,
   APIGatewayProxyResult
} from "aws-lambda";
import { isAdminAuthorized } from "middleware/auth";
import { handleErrorResponse } from "middleware/errors";
import { getPathParameter } from "middleware/url";
import { isStr, isValidJSONBody } from "middleware/validators";
import { processChangePassword } from "./processor";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
   try {
      await isAdminAuthorized(event);
      const userId = getPathParameter("userId", event.pathParameters);
      const form = isValidJSONBody(event.body);
      const password = isStr(form, "password", true);

      await processChangePassword(userId, password);
      return {
         statusCode: 200,
         body: ""
      }
   }
   catch (error) {
      return handleErrorResponse(error);
   }
}