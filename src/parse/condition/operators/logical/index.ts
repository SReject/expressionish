import operatorAnd from './operators/and';
import operatorOr from './operators/or';

export { default as notOperator } from './operators/not';

export default new Map([
    ['&&', operatorAnd],
    ['||', operatorOr]
]);