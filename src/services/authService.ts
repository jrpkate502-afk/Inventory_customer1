export interface SheetUser {
  username: string;
  company: string;
}

const USERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/13rVzeukFhX_FScWzR4C67y_Lp9GrGghYi4BXtT9_Jf4/export?format=csv&gid=0";

export async function authenticateUser(usernameInput: string, passwordInput: string): Promise<SheetUser | null> {
  try {
    const response = await fetch(USERS_SHEET_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch user database");
    }

    const csvText = await response.text();
    const rows = csvText.split(/\r?\n/).map(row => parseCSVRow(row)).filter(row => row.length > 0);

    if (rows.length < 2) return null;

    const headers = rows[0];
    
    // Find index of columns (case-insensitive and trimmed)
    const usernameIndex = headers.findIndex(h => h.trim().toLowerCase() === "username");
    const passwordIndex = headers.findIndex(h => h.trim().toLowerCase() === "password");
    const companyIndex = headers.findIndex(h => h.trim().toLowerCase() === "company");

    if (usernameIndex === -1 || passwordIndex === -1) {
      console.error("Columns 'Username' or 'Password' not found in Google Sheet. Available columns:", headers);
      return null;
    }

    const cleanInputUser = usernameInput.trim().toLowerCase();
    const cleanInputPass = passwordInput.trim();

    // Scan through all user records
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const dbUser = row[usernameIndex]?.trim();
      const dbPass = row[passwordIndex]?.trim();
      const dbCompany = companyIndex !== -1 ? row[companyIndex]?.trim() : "";

      if (dbUser && dbUser.toLowerCase() === cleanInputUser && dbPass === cleanInputPass) {
        return {
          username: dbUser,
          company: dbCompany || "User"
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
