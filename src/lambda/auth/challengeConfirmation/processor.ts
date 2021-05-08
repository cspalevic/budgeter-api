import { UnauthorizedError } from "models/errors";
import { AuthResponse } from "models/responses";
import BudgeterMongoClient from "services/external/mongodb/client";
import { generateAccessToken } from "services/internal/security/accessToken";
import { generateRefreshToken } from "services/internal/security/refreshToken";
import { ChallengeConfirmationBody } from "./validator";

export const processChallengeConfirmation = async (
   challengeConfirmationBody: ChallengeConfirmationBody
): Promise<AuthResponse> => {
   const budgeterClient = await BudgeterMongoClient.getInstance();
   const usersService = budgeterClient.getUsersCollection();
   const oneTimeCodeService = budgeterClient.getOneTimeCodeCollection();
   const refreshTokenService = budgeterClient.getRefreshTokenCollection();

   let oneTimeCode = await oneTimeCodeService.find({
      key: challengeConfirmationBody.key,
      code: challengeConfirmationBody.code
   });
   if (!oneTimeCode || oneTimeCode.expiresOn < Date.now())
      throw new UnauthorizedError();

   oneTimeCode.completed = true;
   oneTimeCode = await oneTimeCodeService.update(oneTimeCode);

   const user = await usersService.getById(oneTimeCode.userId.toHexString());
   if (
      oneTimeCode.type === "userVerification" ||
      oneTimeCode.type === "newUserVerification"
   ) {
      user.isMfaVerified = true;
      await usersService.update(user);
   }

   const refreshToken = generateRefreshToken(oneTimeCode.userId);
   const accessToken = generateAccessToken(
      oneTimeCode.userId.toHexString(),
      refreshToken.token
   );

   await refreshTokenService.create(refreshToken);

   return {
      accessToken: accessToken.token,
      expires: accessToken.expires,
      refreshToken: refreshToken.token
   };
};
