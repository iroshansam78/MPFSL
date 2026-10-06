# MPFSL

MPFSL is a starter project scaffold for multi-party federated split learning experiments.

## Project structure

- `src/mpfsl/` — main package code
- `tests/` — automated tests
- `docs/` — design and technical notes
- `notebooks/` — exploratory analysis and experiments
- `scripts/` — utility scripts

## Getting started

1. Create a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the package entrypoint:
   ```bash
   python -m mpfsl
   ```

## Typical workflow

- Define data loaders and preprocessing under `src/mpfsl/data/`
- Add split model definitions under `src/mpfsl/models/`
- Implement training logic under `src/mpfsl/training/`
- Add evaluation and metrics under `src/mpfsl/evaluation/`

## Notes

This repository is intentionally scaffolded for quick extension into a research or production workflow.
