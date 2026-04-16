
export const THAI_HOLIDAYS_2026 = [
  "2026-01-01", // New Year's Day
  "2026-03-03", // Makha Bucha Day
  "2026-04-06", // Chakri Memorial Day
  "2026-04-13", // Songkran Festival
  "2026-04-14", // Songkran Festival
  "2026-04-15", // Songkran Festival
  "2026-05-01", // Labor Day
  "2026-05-04", // Coronation Day
  "2026-05-22", // Royal Ploughing Ceremony (estimated)
  "2026-06-01", // Visakha Bucha Day (Observed)
  "2026-06-03", // Queen Suthida's Birthday
  "2026-07-28", // King Vajiralongkorn's Birthday
  "2026-07-29", // Asalha Bucha Day
  "2026-07-30", // Khao Phansa Day
  "2026-08-12", // Mother's Day
  "2026-10-13", // King Bhumibol Memorial Day
  "2026-10-23", // Chulalongkorn Day
  "2026-12-07", // Father's Day (Observed)
  "2026-12-10", // Constitution Day
  "2026-12-31", // New Year's Eve
];

export function isThaiHoliday(date: Date): boolean {
  const dateString = date.toISOString().split("T")[0];
  return THAI_HOLIDAYS_2026.includes(dateString);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

export function addThaiWorkingDays(startDate: Date, daysToAdd: number): Date {
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (!isWeekend(currentDate) && !isThaiHoliday(currentDate)) {
      addedDays++;
    }
  }
  return currentDate;
}

export function parseThaiDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try to handle formats like DD/MM/YYYY or YYYY-MM-DD
  const parts = dateStr.trim().split(/[/.-]/);
  if (parts.length === 3) {
    let day, month, year;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      // DD/MM/YYYY
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
    }
    
    // Handle Thai Buddhist Year (e.g. 2569)
    if (year > 2400) {
      year -= 543;
    }
    
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    if (!isNaN(date.getTime())) return date;
  }
  
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}
