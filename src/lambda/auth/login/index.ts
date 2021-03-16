import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { processSignIn } from "./processor";
import { handleErrorResponse } from "middleware/errors";
import { isStr, isValidJSONBody } from "middleware/validators";

export interface LoginBody {
   email: string;
   password: string;
}

const validator = (event: APIGatewayProxyEvent): LoginBody => {
   const form = isValidJSONBody(event.body);
   const email = isStr(form, "email", true);
   const password = isStr(form, "password", true);
   return { email, password };
};

export const handler = async (
   event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
   try {
      const loginBody = validator(event);
      const response = await processSignIn(loginBody);
      return {
         statusCode: response.status,
         body: JSON.stringify(response.response),
         headers: {
            "Access-Control-Allow-Origin": "*",
         },
      };
   } catch (error) {
      return handleErrorResponse(error);
   }
};
