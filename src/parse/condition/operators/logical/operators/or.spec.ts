import '../../../../../../jest/helpers';
import Token from '../../../../token';

import orOperator from './or';

test('Exports an operator definition', () => {
    expect(orOperator).toBeAnOperator();
});

test('Returns true when first arg is true', async () => {

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

    const result = await orOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [left, right]
    });

    expect(result).toBe(true);
    expect(leftCalled).toBe(1);
    expect(rightCalled).toBe(0);
});

test('Returns true when second arg is true', async () => {

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
        return true;
    };

    expect.assertions(3);

    const result = await orOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [left, right]
    });

    expect(result).toBe(true);
    expect(leftCalled).toBe(1);
    expect(rightCalled).toBe(1);
});

test('Returns false when both args are false', async () => {

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

    const result = await orOperator.handle({}, {}, {
        caseSensitive: false,
        arguments: [left, right]
    });

    expect(result).toBe(false);
    expect(leftCalled).toBe(1);
    expect(rightCalled).toBe(1);
});