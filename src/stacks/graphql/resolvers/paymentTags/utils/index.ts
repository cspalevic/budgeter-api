import { PaymentTag, PublicPaymentTag } from "models/schemas/paymentTag";
import { WithId } from "mongodb";

export const transformResponse = (
   paymentTag: WithId<PaymentTag>
): PublicPaymentTag => ({
   id: paymentTag._id.toHexString(),
   tag: paymentTag.tag,
   modifiedOn: paymentTag.modifiedOn,
   createdOn: paymentTag.createdOn
});
