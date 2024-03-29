import { middy } from "middleware/handler/lambda";
import { processPasswordReset } from "./processor";
import { validate } from "./validator";

export const handler = middy()
   .useJsonBodyParser()
   .use(validate)
   .use(processPasswordReset)
   .go();
