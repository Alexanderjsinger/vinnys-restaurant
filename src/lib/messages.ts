export function firstQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function adminError(code: string | undefined): string | null {
  switch (code) {
    case "required":
      return "Add the required fields, then save again.";
    case "email":
      return "Enter a valid email, or leave email blank.";
    case "time":
      return "Each hours row needs a label, an opening time, and a closing time.";
    case "date":
      return "Opening date must be a real calendar date, or left blank.";
    case "url":
      return "Links must start with http:// or https://.";
    case "link":
      return "A promo link needs both a label and a URL, or neither.";
    case "provider":
      return "Choose None, Toast Tables, OpenTable, or Resy.";
    case "confirm":
      return "Check the delete box before deleting.";
    case "price":
      return "Price must be a number like 12 or 12.50.";
    case "rate":
      return "Too many attempts. Wait a few minutes and try again.";
    case "unknown":
      return "That save could not be matched.";
    case "save":
      return "The save did not finish. Try again.";
    default:
      return null;
  }
}

export function partyError(code: string): string {
  switch (code) {
    case "name":
      return "Enter your name.";
    case "email":
      return "Enter a valid email.";
    case "date":
      return "Choose today or a later date.";
    case "size":
      return "Enter a party size from 1 to 500.";
    case "message":
    case "event":
      return "Say what kind of gathering it is.";
    case "save":
      return "That note did not save. Call the restaurant and try again.";
    case "rate":
      return "Too many notes were sent just now. Call the restaurant, or try again later.";
    default:
      return "Check the form and try again.";
  }
}
