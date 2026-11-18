import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

for split in ["train", "test"]:
    split_dir = os.path.join(BASE_DIR, split)
    print("\n" + split.upper())
    if os.path.isdir(split_dir):
        for kelas in os.listdir(split_dir):
            path = os.path.join(split_dir, kelas)
            if os.path.isdir(path):
                print(f"  {kelas} : {len(os.listdir(path))} citra")