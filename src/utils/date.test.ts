import { formatDate, formatTime, parseDate, parseTime } from './date';

test('formatDate formats as YYYY-MM-DD', () => {
  const d = new Date(2023, 4, 10); // May 10, 2023
  expect(formatDate(d)).toBe('2023-05-10');
});

test('formatTime formats as HH:MM', () => {
  const d = new Date(2023, 4, 10, 14, 30);
  expect(formatTime(d)).toBe('14:30');
});

test('parseDate parses YYYY-MM-DD', () => {
  const d = parseDate('2023-05-10');
  expect(d.getFullYear()).toBe(2023);
  expect(d.getMonth()).toBe(4);
  expect(d.getDate()).toBe(10);
});

test('parseTime parses HH:MM', () => {
  const d = parseTime('14:30');
  expect(d.getHours()).toBe(14);
  expect(d.getMinutes()).toBe(30);
});
