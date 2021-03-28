import { AdminPublicUser, User } from "models/data/user";
import { NotFoundError } from "models/errors";
import { GetListQueryStringParameters } from "models/requests";
import { GetResponse } from "models/responses";
import { FilterQuery, FindOneOptions, ObjectId } from "mongodb";
import BudgeterMongoClient from "services/external/mongodb/client";

export const processGetMany = async (
   adminId: ObjectId,
   queryStringParameters: GetListQueryStringParameters
): Promise<GetResponse<AdminPublicUser>> => {
   const budgeterClient = await BudgeterMongoClient.getInstance();
   const usersService = budgeterClient.getUsersCollection();

   const usersAmount = await usersService.count();
   const query: FilterQuery<User> = {};
   if (queryStringParameters.search) {
      query.title = {
         $regex: queryStringParameters.search,
         $options: "$I"
      };
   }
   const queryOptions: FindOneOptions<User> = {
      limit: queryStringParameters.limit,
      skip: queryStringParameters.skip
   };
   const users = await usersService.findMany(query, queryOptions);

   return {
      count: usersAmount,
      values: users.map((x) => ({
         id: x._id.toHexString(),
         isAdmin: x.isAdmin,
         firstName: x.firstName,
         lastName: x.lastName,
         email: x.email,
         emailVerified: x.isEmailVerified,
         createdOn: x.createdOn,
         modifiedOn: x.modifiedOn
      }))
   };
};

export const processGetSingle = async (
   adminId: ObjectId,
   userId: ObjectId
): Promise<AdminPublicUser> => {
   const budgeterClient = await BudgeterMongoClient.getInstance();
   const usersService = budgeterClient.getUsersCollection();

   const user = await usersService.find({ _id: userId });
   if (!user) throw new NotFoundError("No User found with the given Id");

   return {
      id: user._id.toHexString(),
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.isEmailVerified,
      createdOn: user.createdOn,
      modifiedOn: user.modifiedOn
   };
};
