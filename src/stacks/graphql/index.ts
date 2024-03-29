import { middy } from "middleware/handler/lambda";
import { graphql } from "graphql";
import { auth } from "middleware/auth";
import { UnauthorizedError, ValidationError } from "models/errors";
import schema from "./utils/schema";
import resolvers from "./utils/resolvers";
import { BudgeterRequest } from "models/requests";

const executeGraphqlQuery = async (request: BudgeterRequest) => {
   const body = request.body;
   const query = body["query"] as string;
   const variables = body["variables"] as Record<string, unknown>;
   console.log("Graphql Request:");
   console.log(request);
   const executionResult = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      contextValue: request.auth,
      variableValues: variables
   });
   if (executionResult.errors) {
      console.log("Graphql Execution Errors found:");
      console.log(executionResult.errors);
      if (executionResult.errors.some((e) => e.message === "Unauthorized")) {
         throw new UnauthorizedError();
      }
      throw new ValidationError(executionResult.errors.map((e) => e.message));
   }
   return executionResult;
};

export const handler = middy()
   .useAuth(auth)
   .useJsonBodyParser()
   .use(executeGraphqlQuery)
   .go();
