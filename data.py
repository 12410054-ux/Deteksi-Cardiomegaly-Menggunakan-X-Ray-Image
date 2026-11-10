import os

base_path = os.path.dirname(os.path.abspath(__file__))

for split in ["train", "test"]:
    print("\n", split.upper())

    for kelas in os.listdir(os.path.join(base_path, split)):
        path = os.path.join(base_path, split, kelas)
        print(kelas, ":", len(os.listdir(path)))