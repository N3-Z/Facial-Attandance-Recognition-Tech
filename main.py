import os
from flask import Flask, json, render_template, request, current_app
from face import face_check
from datetime import datetime
from component import saveImage

AttendanceListClockIn = []
AttendanceListClockOut = []

api = Flask(__name__)
api.config["DEBUG"] = True



@api.route('/', methods=['GET'])
def home():
    return render_template('home.html')

def listToString(s):  
    str1 = ""  
    
    for ele in s:  
        str1 += ele+" "
    
    return str1  

@api.route('/face_match_in', methods=['POST'])
def face_match_in():
    global AttendanceListClockIn
    data = request.get_json()
    print(data)
    data_image = data['img_data']
    data_ip = data['ip']
    saveImage(data_image)

    output = face_check()
    if output is None:
        print("Output null, returning None. . .")
        return {"error": "DetectFaceError"}
    time = datetime.now()
    currentTime = time.strftime("%H:%M:%S")
    
    return_output = {
        "name" : output,
        "time" : currentTime,
        "ip": data_ip,
        "error":""
        }
    checked = False
    for i in AttendanceListClockIn:
        if output in i['name']:
            checked = True
    
    if checked == False:
        AttendanceListClockIn.append(return_output)      
        # write to file
        with open("clock_in.txt", "a+") as f:
            f.write( listToString( return_output.values() ) +"\n" )

    print(AttendanceListClockIn)

    return return_output

@api.route('/face_match_out', methods=['POST'])
def face_match_out():
    global AttendanceListClockOut
    data = request.get_json()
    data_image = data['img_data']
    data_ip = data['ip']
    saveImage(data_image)

    output = face_check()
    if output is None:
        print("Output null, returning None. . .")
        return {"error": "DetectFaceError"}
    time = datetime.now()
    currentTime = time.strftime("%H:%M:%S")
    
    return_output = {
        "name" : output,
        "time" : currentTime,
        "ip": data_ip,
        "error": ""
        }
    checked = False
    for i in AttendanceListClockOut:
        if output in i['name']:
            checked = True
    
    if checked == False:
        AttendanceListClockOut.append(return_output)      
        # write to file
        with open("clock_out.txt", "a+") as f:
            f.write( listToString( return_output.values() ) +"\n" )

    print(AttendanceListClockOut)

    return return_output

@api.route('/get_attendance_in', methods=['GET'])
def get_attendance_in():
    global AttendanceListClockIn
    return json.dumps(AttendanceListClockIn)

@api.route('/get_attendance_out', methods=['GET'])
def get_attendance_out():
    global AttendanceListClockOut
    return json.dumps(AttendanceListClockOut)

@api.route('/clock_in',methods=['GET'])
def clock_in():
    return render_template('index_in.html')

@api.route('/clock_out',methods=['GET'])
def output():
    return render_template('index_out.html')

def main():
    api.run()

if __name__ == '__main__':
    main()
    
    