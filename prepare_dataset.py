import os
import shutil
source_dir = os.path.expanduser("~/Downloads/archive/images/images")
output_dir = os.path.expanduser("~/FurryMatcher-backend/dataset")
for filename in os.listdir(source_dir):
    if not filename.endswith(".jpg"):
        continue


    parts = filename.rsplit("_", 1)
    breed = parts[0]

    breed_folder = os.path.join(output_dir, breed)
    os.makedirs(breed_folder, exist_ok=True)
    src =os.path.join(source_dir, filename)
    dst = os.path.join(breed_folder, filename)
    shutil.copy2(src, dst)

print("Done! Images sorted into breed folders.")
