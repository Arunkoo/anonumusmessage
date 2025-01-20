import { z } from "zod";

export const verifySchema = z.object({
  verifyCode: z.string().length(6, "Please provide a valid verify code"),
});
