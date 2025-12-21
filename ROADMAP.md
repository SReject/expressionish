## 1.0.0 Release
- Finish unit tests
- Document usage

## 1.1.0 Release
- Implement `permissive` option to treat undefined vars and lookups as plain text
- Replace `$and[]` with `condition && condition ...` syntax
- Replace `$or[]` with `condition || condition ...` syntax
- Replace `$not[]` with `![condition]` syntax
- Move to a `stream` like reader instead of requiring multiple passes(split -> tokenize)