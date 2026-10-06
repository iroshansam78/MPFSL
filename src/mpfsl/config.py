"""Application configuration settings for the MPFSL project."""

from dataclasses import dataclass


@dataclass(frozen=True)
class ProjectConfig:
    """Basic runtime configuration for experiments."""

    seed: int = 42
    device: str = "cpu"
    batch_size: int = 32
    epochs: int = 10
    learning_rate: float = 1e-3


def load_config() -> ProjectConfig:
    """Return a default project configuration."""
    return ProjectConfig()
