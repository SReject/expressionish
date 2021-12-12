const ARG_DELIMITERS = ',]'
export default function tokenizeConditionBlock(result, tokens, delimiters) {
    if (delimiters == null || delimiters === '') {
        delimiters = ARG_DELIMITERS;
    }

}