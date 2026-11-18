"""Entrypoint proxy for ROC curve comparison."""
import os
import sys
import runpy

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    target = os.path.join(base_dir, "ml_pipeline", "evaluation", "duamodel.py")
    sys.path.insert(0, base_dir)
    runpy.run_path(target, run_name="__main__")
