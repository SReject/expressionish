import '../../../../../../jest/helpers';
import Token from '../../../../token';

import notOperator from './not';

test('Exports an operator definition', () => {
    expect(notOperator).toBeAnOperator();
});

test('Returns false when arg is truthy', async () => {
    let argCalls = 0;
    const arg = new Token();
    arg.evaluate = async () => {
        argCalls += 1;
        return true;
    };

    expect.assertions(2);

    const result = await notOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [arg]
    });

    expect(result).toBe(false);
    expect(argCalls).toBe(1);
});

test('Returns true when arg is falsey', async () => {
    let argCalls = 0;
    const arg = new Token();
    arg.evaluate = async () => {
        argCalls += 1;
        return false;
    };

    expect.assertions(2);

    const result = await notOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [arg]
    });

    expect(result).toBe(true);
    expect(argCalls).toBe(1);
});