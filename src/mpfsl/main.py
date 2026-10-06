"""Entry point for the MPFSL package."""

from mpfsl.config import load_config


def main() -> None:
    config = load_config()
    print(f"MPFSL initialized with seed={config.seed}, device={config.device}")


if __name__ == "__main__":
    main()
