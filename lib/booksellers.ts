import { z } from "zod";
import { contactSchema } from "./contact";

export const booksellerSchema = z.object({
  name: contactSchema.shape.name,
  bookshop: z.string().trim().min(1, "Please enter your bookshop’s name.").max(200, "Please keep the bookshop name under 200 characters."),
  email: contactSchema.shape.email,
  location: z.string().trim().min(1, "Please tell us where your bookshop is based.").max(200, "Please keep the location under 200 characters."),
  message: contactSchema.shape.message,
});

export type BooksellerField = keyof z.infer<typeof booksellerSchema>;
export type BooksellerErrors = Partial<Record<BooksellerField, string>>;

export function booksellerErrors(error: z.ZodError): BooksellerErrors {
  const errors: BooksellerErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as BooksellerField;
    if (field in booksellerSchema.shape && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
