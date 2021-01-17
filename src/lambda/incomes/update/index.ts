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
   const title = isStr(form, "title", true);
   const amount = isNumber(form, "amount", true);
   const occurrenceDate = isDate(form, "occurrenceDate", true);
   const recurrence = isOneOfStr(form, "recurrence", ["daily", "weekly", "biweekly", "monthly", "yearly"], true) as Recurrence;

   return {
      _id: incomeId,
      userId,
      title,
      amount,
      occurrenceDate,
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