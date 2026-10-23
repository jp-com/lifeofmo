import { z } from "zod";

export const enquiryTypes = [
  "Book or order",
  "Bookshops",
  "Press & collaborations",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Please keep your name under 100 characters."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  topic: z.enum(enquiryTypes, { message: "Please choose an enquiry type." }),
  message: z.string().trim().min(10, "Please tell us a little more (at least 10 characters).").max(5000, "Please keep your message under 5,000 characters."),
});

export type ContactField = keyof z.infer<typeof contactSchema>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export function contactErrors(error: z.ZodError): ContactErrors {
  const errors: ContactErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactField;
    if (field in contactSchema.shape && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
