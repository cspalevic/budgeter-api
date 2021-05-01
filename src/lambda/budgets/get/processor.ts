import { GetBudgetsBody } from ".";
import BudgeterMongoClient from "services/external/mongodb/client";
import { GetBudgetResponse } from "models/responses";
import { getQuery } from "services/internal/budgets/query";
import { getBudgetItems } from "services/internal/budgets/determine";
import { PublicBudgetItemWithInfo } from "models/data/budgetItem";

export const getBudget = async (
   request: GetBudgetsBody
): Promise<GetBudgetResponse> => {
   const response = await Promise.all([
      await getIncomes(request),
      await getPayments(request)
   ]);

   return {
      incomes: response[0],
      payments: response[1]
   };
};

const getIncomes = async (
   request: GetBudgetsBody
): Promise<PublicBudgetItemWithInfo[]> => {
   const budgeterClient = await BudgeterMongoClient.getInstance();
   const incomesService = budgeterClient.getIncomesCollection();
   const query = getQuery(request.userId, request.queryStrings);
   const incomes = await incomesService.findMany(query);
   return getBudgetItems(incomes, request.queryStrings);
};

const getPayments = async (
   request: GetBudgetsBody
): Promise<PublicBudgetItemWithInfo[]> => {
   const budgeterClient = await BudgeterMongoClient.getInstance();
   const paymentsService = budgeterClient.getPaymentsCollection();
   const query = getQuery(request.userId, request.queryStrings);
   const payments = await paymentsService.findMany(query);
   return getBudgetItems(payments, request.queryStrings);
};
