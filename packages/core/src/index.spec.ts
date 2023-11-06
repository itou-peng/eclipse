import { Eclipse } from './index';

describe('the sample example', () => {
  test('use eclipse', () => {
    const eclipse = new Eclipse();
    eclipse.register<string>({
      id: 'id',
      name: 'print',
      run: (data) => {
        expect(data).toEqual('Hello World');
      },
    });
    eclipse.trigger<string>({
      name: 'print',
      data: 'Hello World',
    });
  });
});
