import {
   APIGatewayProxyEvent,
   APIGatewayProxyResult
} from "aws-lambda";
import { isAuthorized } from "middleware/auth";
import { handleErrorResponse } from "middleware/errors";
import { getPathParameter } from "middleware/url";
import { isDate, isNumber, isOneOfStr, isStr, isValidJSONBody } from "middleware/validators";
import { Income } from "models/data/income";
import { Recurrence } from "models/data/recurrence";
import { processUpdateIncome } from "./processor";

const validator = async (event: APIGatewayProxyEvent): Promise<Partial<Income>> => {
   const userId = await isAuthorized(event);
   const incomeId = getPathParameter("incomeId", event.pathParameters);
   const form = isValidJSONBody(event.body);
   const title = isStr(form, "title");
   const amount = isNumber(form, "amount");
   const initialDay = isNumber(form, "initialDay", true);
   const initialMonth = isNumber(form, "initialMonth", true);
   const initialYear = isNumber(form, "initialYear", true);
   const recurrence = isOneOfStr(form, "recurrence", ["daily", "weekly", "biweekly", "monthly", "yearly"]) as Recurrence;

   return {
      _id: incomeId,
      userId,
      title,
      amount,
      initialDay,
      initialMonth,
      initialYear,
      recurrence
   }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
   try {
      const incomeBody = await validator(event);
      const response = await processUpdateIncome(incomeBody);
      return {
         statusCode: 200,
         body: JSON.stringify(response)
      }
   }
   catch (error) {
      return handleErrorResponse(error);
   }
}