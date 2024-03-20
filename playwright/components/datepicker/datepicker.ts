import { Locator, Page } from '@playwright/test';

export class Datepicker {
  readonly page: Page;
  readonly dateButtonNotSelected: Locator;
  readonly previousYearButton: Locator;
  readonly nextYearButton: Locator;
  readonly previousMonthButton: Locator;
  readonly nextMonthButton: Locator;

  async selectDate(date: Date) {
    await this.page.getByLabel(formatDate(date)).click();
  }

  constructor(page: Page) {
    this.page = page;
    this.dateButtonNotSelected = page.getByRole('button', { name: 'No date selected' });
    this.previousYearButton = page.getByLabel('Previous year');
    this.nextYearButton = page.getByLabel('Next year');
    this.previousMonthButton = page.getByLabel('Previous month');
    this.nextMonthButton = page.getByLabel('Next month');
  }

  async openDatepickerFirstTime() {
    await this.dateButtonNotSelected.click();
  }


}

function formatDate(date: Date): string {
  // Array of day names
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Array of month names
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get the day name
  const dayName = days[date.getDay()];

  // Get the month name
  const monthName = months[date.getMonth()];

  // Get the day of the month
  const dayOfMonth = date.getDate();

  // Construct the formatted string
  return `${dayName}, ${monthName} ${String(dayOfMonth).padStart(2, '0')},`;
}
