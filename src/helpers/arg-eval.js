const evalArg = async (options, argParts) => {

    const partValues = [];
    for (const part of argParts) {
        const value = await part.evaluate(options);
        if (value != null) {
            partValues.push(value);
        }
    }

    if (partValues.length === 0) {
        return null;
    }

    if (partValues.length === 1) {
        return partValues[0];
    }

    return partValues.reduce((prev, curr) => {
        if (curr == null) {
            return prev;
        }
        if (typeof curr === 'string') {
            return prev + curr;
        }
        return prev + JSON.stringify(curr);
    }, '');
}

module.exports.evalArg = evalArg;
module.exports.evalArgsList = async (options, arglist) => {
    const args = [];

    if (arglist != null && arglist.length > 0) {
        for (let idx = 0; idx < arglist.length; idx += 1) {
            args.push(await evalArg(options, arglist[idx]));
        }
    }

    return args;
};