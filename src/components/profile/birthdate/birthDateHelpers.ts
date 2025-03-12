
export const createDateFromParts = (
  year: number,
  month: number,
  day: number
): Date => {
  // Create a Date in UTC to avoid timezone issues
  return new Date(Date.UTC(year, month, day));
};

export const handleYearChangeHelper = (
  value: string,
  birthMonth: number | undefined,
  birthDay: number | undefined,
  onDateChange: (date: Date) => void
): void => {
  const year = parseInt(value, 10);
  if (!isNaN(year)) {
    const newDate = new Date(Date.UTC(
      year,
      birthMonth !== undefined ? birthMonth : 0,
      birthDay !== undefined ? birthDay : 1
    ));
    onDateChange(newDate);
  }
};

export const handleMonthChangeHelper = (
  value: string,
  birthYear: number | undefined,
  birthDay: number | undefined,
  onDateChange: (date: Date) => void
): void => {
  const month = parseInt(value, 10);
  if (!isNaN(month)) {
    const year = birthYear || new Date().getUTCFullYear();
    let day = birthDay || 1;
    
    // Check if the day is valid for this month
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    if (day > daysInMonth) {
      day = daysInMonth;
    }
    
    const newDate = new Date(Date.UTC(year, month, day));
    onDateChange(newDate);
  }
};

export const handleDayChangeHelper = (
  value: string,
  birthYear: number | undefined,
  birthMonth: number | undefined,
  onDateChange: (date: Date) => void
): void => {
  const day = parseInt(value, 10);
  if (!isNaN(day)) {
    const year = birthYear || new Date().getUTCFullYear();
    const month = birthMonth !== undefined ? birthMonth : 0;
    
    const newDate = new Date(Date.UTC(year, month, day));
    onDateChange(newDate);
  }
};
