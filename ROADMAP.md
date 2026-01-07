## 1.0.x Release
- Finish unit tests
- Document usage

## 1.1.x Release
- Move to a `stream` like reader instead of requiring multiple passes(split -> tokenize)
- Implement `permissive` option to treat undefined vars and lookups as plain text
- Implement `fromJSON` function to convert json back into Expression instance

## 1.2.x Release
- Replace `$and[]` with `condition && condition ...` syntax
- Replace `$or[]` with `condition || condition ...` syntax
- Replace `$not[]` with `![condition]` syntax