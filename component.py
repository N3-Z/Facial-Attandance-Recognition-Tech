import base64

def saveImage(data):
    img_base64 = data.replace("data:image/png;base64,","")
    imgdata = base64.b64decode(img_base64)
    f = open("checkeddata.png", "wb")
    print("Writing image. . .")
    f.write(imgdata)
    print("Image written!")
    f.close()