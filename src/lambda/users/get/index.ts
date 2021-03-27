import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isAdminAuthorized } from "middleware/auth";
import { handleErrorResponse } from "middleware/errors";
import { getPathParameter, getListQueryStringParameters } from "middleware/url";
import { AdminPublicUser } from "models/data/user";
import { GetListQueryStringParameters } from "models/requests";
import { GetResponse } from "models/responses";
import { ObjectId } from "mongodb";
import { processGetMany, processGetSingle } from "./processor";

export interface GetUsersBody {
   adminId: ObjectId;
   queryStrings?: GetListQueryStringParameters;
   pathParameters?: { userId: ObjectId };
}

const validator = async (
   event: APIGatewayProxyEvent
): Promise<GetUsersBody> => {
   const adminId = await isAdminAuthorized(event);
   if (event.pathParameters === null) {
      const queryStrings = getListQueryStringParameters(
         event.queryStringParameters
      );
      return {
         adminId,
         queryStrings
      };
   } else {
      const userId = getPathParameter("userId", event.pathParameters);
      return {
         adminId,
         pathParameters: {
            userId
         }
      };
   }
};

export const handler = async (
   event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
   try {
      const getIncomesBody = await validator(event);
      let response: GetResponse<AdminPublicUser> | AdminPublicUser;
      if (getIncomesBody.queryStrings)
         response = await processGetMany(
            getIncomesBody.adminId,
            getIncomesBody.queryStrings
         );
      else
         response = await processGetSingle(
            getIncomesBody.adminId,
            getIncomesBody.pathParameters.userId
         );
      return {
         statusCode: 200,
         body: JSON.stringify(response)
      };
   } catch (error) {
      return handleErrorResponse(error);
   }
};
