import { render } from './helper';
import { Home } from '../src/home';

describe('my-app', () => {
  it('should render message', async () => {
    const node = (await render('<my-app></my-app>', Home)).firstElementChild;
    const text = node.textContent;
    // expect(text.trim()).toBe('Hello World!');
  });
});
