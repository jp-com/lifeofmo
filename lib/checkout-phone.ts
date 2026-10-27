// UK delivery is the default; preserve explicit international country codes.
export function normalizeCheckoutPhone(value: string): string | null {
  if (value.length > 32 || !/^[+\d\s().-]+$/.test(value)) return null;
  let phone = value.replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  else if (phone.startsWith("0")) phone = `+44${phone.slice(1)}`;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export const phoneError = "Enter a phone number starting with 0 or an international country code, such as +44.";
