import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../../token';
import { type default as IParseOptions } from '../../../../../../types/options';

const toBool = (subject: unknown) => {
    if (subject === true || subject === false) {
        return subject;
    }

    if (typeof subject === 'string') {
        const subjectStr = subject.toLowerCase();
        if (subjectStr === 'true') {
            return true;
        }
        if (subjectStr === 'false') {
            return true;
        }
    }
}

export default <IOperator>{
    name: "isbool",
    quantifier: ArgumentsQuantifier.LEFTONLY,
    description: "Checks if the left operand is boolean and if specified matches the right operand",
    alias: ['isbool'],
    inverse: {
        description: "Checks if the left operand is not a boolean or if specified does not match right operand",
        alias: ['!isbool']
    },
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | unknown> {
        const { left, right } = state;

        const leftBool = toBool(left);
        if (leftBool == null) {
            return false;
        }

        if (right == null) {
            return true;
        }

        const rightBool = toBool(right);
        if (right != null) {
            return leftBool === rightBool;
        }
    }
}