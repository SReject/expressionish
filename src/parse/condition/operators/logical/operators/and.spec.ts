import '../../../../../../jest/helpers';
import Token from '../../../../token';

import andOperator from './and';

test('Exports an operator definition', () => {
    expect(andOperator).toBeAnOperator();
});

test('Returns false when first arg is false', async () => {

    const left = new Token();
    let leftCalled = 0;
    left.evaluate = async () => {
        leftCalled += 1;
        return false;
    };

    const right = new Token();
    let rightCalled = 0;
    right.evaluate = async () => {
        rightCalled += 1;
        return false;
    };

    expect.assertions(3);

    const result = await andOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [left, right]
    });

    expect(result).toBe(false);
    expect(leftCalled).toBe(1);
    expect(rightCalled).toBe(0);
});

test('Returns false when second arg is false', async () => {

    const left = new Token();
    let leftCalled = 0;
    left.evaluate = async () => {
        leftCalled += 1;
        return true;
    };

    const right = new Token();
    let rightCalled = 0;
    right.evaluate = async () => {
        rightCalled += 1;
        return false;
    };

    expect.assertions(3);

    const result = await andOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [left, right]
    });

    expect(result).toBe(false);
    expect(leftCalled).toBe(1);
    expect(rightCalled).toBe(1);
});

test('Returns true when both args are true', async () => {

    const left = new Token();
    let leftCalled = 0;
    left.evaluate = async () => {
        leftCalled += 1;
        return true;
    };

    const right = new Token();
    let rightCalled = 0;
    right.evaluate = async () => {
        rightCalled += 1;
        return true;
    };

    expect.assertions(3);

    const result = await andOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [left, right]
    });

    expect(result).toBe(true);
    expect(leftCalled).toBe(1);
    expect(rightCalled).toBe(1);
});