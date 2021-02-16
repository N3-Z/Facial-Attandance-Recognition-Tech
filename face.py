import face_recognition
import os

LISTNAME = []
LISTDIR = os.listdir("./images/")

print("Fetching all images. . .")
for i in LISTDIR:
    path = "./images/"+i
    data = face_recognition.load_image_file(path)
    data_enc = face_recognition.face_encodings(data)[0]
    LISTNAME.append(data_enc)
print("All images fetched!")

def getNameIDX(results):
    global LISTDIR
    idx = 0
    for i in results:
        if i == True:
            return LISTDIR[idx].split(".")[0]
        idx += 1
    return ""

def face_check():
    print("Fetching checkeddata.png. . .")
    student_data = face_recognition.load_image_file("checkeddata.png")
    print("Fetching encoding. . .")
    try:
        student_data_enc = face_recognition.face_encodings(student_data)[0]

        results = face_recognition.compare_faces(LISTNAME, student_data_enc)
        print(results)
        found = getNameIDX(results)
        print("Encoding fetched!")
        return found
    except IndexError as e:
        print(e)
        print("Whoops, face not detected :(")
        return
