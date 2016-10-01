import { createView } from '../../view';
import { string } from '../../schemas';

test('string', () => {
  const view = createView(string(100));

  expect(typeof view.value).toBe('string');
  expect(view.value).toBe('');

  view.value = 'Hello there';
  expect(view.value).toBe('Hello there');
});

test('too long string', () => {
  const view = createView(string(3));

  expect(typeof view.value).toBe('string');
  expect(view.value).toBe('');

  view.value = 'Hello there';
  expect(view.value).toBe('Hel');
});

test('long string, then short', () => {
  const view = createView(string(1000));

  expect(view.value).toBe('');
  view.value = 'Hello there';
  expect(view.value).toBe('Hello there');
  view.value = 'Disco';
  expect(view.value).toBe('Disco');
});
