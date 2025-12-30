# setup-smt

This GitHub Action sets up the SMT (Satisfiability Modulo Theories) solver
environment for your workflows. It currently supports Z3 (4.14.0) and CVC5
(1.2.1).

## Usage

To use this action, include it in your workflow YAML file:

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up SMT
        uses: keyproject/setup-smt

      - name: Run solver
        run: z3 <yoursmt smt-solver> --version
```

## Inputs

This action does not have any inputs.

## Outputs

This action does not produce any outputs.

## Changelog

- v0.3.0:
  - support for more z3 versions
  - z3/cvc5 versions are now tested for installation and runnable in ci
  - z3 or cvc5 can be disabled by using 'false' as version identifier

- v0.2.2: fix macos/z3 error (wrong url + binary path)

## License

This project is licensed under the MIT License.
