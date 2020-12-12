import { ObjectId } from "mongodb";

export interface User {
   email: string;
   isService: boolean;
   isAdmin: boolean;
   createdOn?: Date;
   modifiedOn?: Date;
   device?: {
      os: string;
      platformApplicationEndpointArn: string;
      subscriptionArn: string;
   }
}

export interface UserAuth {
   userId: ObjectId;
   hash: string;
}