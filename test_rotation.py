from PIL import Image, ImageOps
import tensorflow as tf

photo_path = "test_photo.jpg"

with open (photo_path, "rb") as f:
    contents = f.read()
img_old = tf.image.decode_image(contents, channels=3)
tf.keras.utils.save_img("old_method_result.jpg", img_old.numpy())

img_new = Image.open(photo_path)
img_new = ImageOps.exif_transpose(img_new)
img_new.save("new_method_result.jpg")

print("All done! Go check the two photos.")