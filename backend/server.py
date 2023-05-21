from fastapi import FastAPI, File, UploadFile, Request, Form
import os
import re
from boundingbox_processing import BoundingBoxProcessing
from image_rotation import ImageRotation
import json
import subprocess

app = FastAPI()



options = {'danger':True, 'alert': True, 'objectName': False, 'threshold':0.7}
detect_class = {'bicycle':True, 'car':True, 'fireHydrant':True, 'furniture':True, 'streetLight':True, 'tree':True, 'wasteContainer':True}
class_dict = {'Bicycle': 'bicycle', 'Car': 'car', "Fire hydrant": 'fireHydrant', "Furniture":'furniture', "Street light":'streetLight', "Tree": 'tree', "Waste container": "wasteContainer"}


@app.get("/test")
def test():
    return "Hello World"

@app.post("/test")
async def test(req:Request):
    data = await req.form()
    print(data)
    delete = data["delete"]
    file = data['file']
    print(file)
    contents = await file.read()
    # print(contents)
    f = open('./data/mike.jpg', 'wb')
    f.write(contents)
    await file.close()

    return delete

@app.get("/darknet")
def darknetTest():
    os.system("darknet.exe detector test cfg/openimages.data cfg/yolov3-openimages.cfg yolov3-openimages.weights -ext_output data/example4.jpeg -thresh 0.10 -dont_show -out result.json")
    f = open("resultbbox.txt", "r")
    result = f.readlines()[12:]
    bbox = ""
    for i in result:
        x = re.search("\(", i)
        if x == None:
            bbox += i

    return bbox


def objectDetection(filename):
    os.system(f"darknet.exe detector test data/obj.data cfg/yolov4-obj.cfg backup/yolov4-obj_last.weights -ext_output -dont_show -out result.json < data/forProcess.txt")
    f = open("resultbbox.txt", "r")
    result = f.read()
    result = bboxProperties(result)
    f.close()
    return result

def objectDetectionMultiple(classes, options):
    os.system(f"darknet.exe detector test data/obj.data cfg/yolov4-obj.cfg backup/yolov4-obj_last.weights -ext_output -dont_show -thresh {options['threshold']} -out result.json < data/forProcess.txt")
    f = open("result.json")
    data = json.load(f)
    coordinates = bboxCoordinatesProcessing(data, len(data), classes)
    f.close()
    return coordinates
    

def bboxCoordinatesProcessing(data, lenData, detect_class):
    ans = []
    dimension = [(2224,4000), (2172,4000), (3000,4000)]
    for i in range(lenData):
        object = data[i]['objects']
        current_frame = []
        for j in range(len(object)):
            current_object = object[j]
            relative_coordinates = current_object['relative_coordinates']
            object_name = current_object['name']
            parsed_name = class_dict[object_name]
            # IF CURRENT OBJECT CLASS IS NOT LISTED IN DETECT OBJECT CONTINUE
            if not detect_class[parsed_name]:
                continue
            # CONVERT BOUNDING BOX COORDINATE
            x = relative_coordinates['center_x']
            y = relative_coordinates['center_y']
            width = relative_coordinates['width']
            height = relative_coordinates['height']
            actual_width = relative_coordinates['width'] * dimension[i][0]
            print(actual_width)
            if actual_width > 1700:
                
                continue
            # LEFT
            x_left = (x - (width/2)) * dimension[i][0]
            # RIGHT
            x_right = (x + (width/2)) * dimension[i][0]
            # Y
            y_bottom = (y + (height/2))*dimension[i][1]
            current_frame.append((x_left, x_right, y_bottom, object_name))
        ans.append(current_frame)
        # print(ans)
    return ans



def bboxProperties(s):
    pattern = "\(left_x:\s+(\d+)\s+top_y:\s+(\d+)\s+width:\s+(\d+)\s+height:\s+(\d+)"
    return re.findall(pattern, s)

def image_rotation(filename, file_path):
    rotate = ImageRotation( file_path,filename)
    return rotate.process_image()

# @app.get("/testJson")
# def testJson():
#     f = open("result.json")
#     data = json.load(f)
#     coordinates = bboxCoordinatesProcessing(data, len(data))
#     f.close()
#     return coordinates

def classes_parsing(dict):
    classes = {}
    for i in detect_class:
        classes[i] = (dict[i] == 'true')
    return classes

def trueParse(param):
    if param == "true":
        return True
    elif param == "false":
        return False
    else:
        return param

def option_parsing(dict):
    option = {}
    for i in options:
        option[i] = trueParse(dict[i])
    return option
    

@app.post("api/v1/old-uploadfile")
async def oldupload(file: UploadFile =File(...)):
    
    contents = await file.read()
    
    f = open('./data/test.jpg', 'wb')
    f.write(contents)
    await file.close()
    # TODO: WRITE FUNCTION TO USE IMAGE ROTATION THAT RETURN THE COORDINATES OF THE OBJECT
    image_rotation('test.jpg', './data/test.jpg')
    # TODO: RE-WRITE THE FUNCTION TO EVALUATE THE BOUNDINGBOX USING THE COORDINATES
    ans = []
    ans.append(objectDetection('test_left.jpg'))
    ans.append(objectDetection('test_right.jpg'))
    ans.append(objectDetection('test.jpg'))
    print(ans)
    bbp = BoundingBoxProcessing()
    ans = bbp.detect_rotated(ans[0],ans[1],ans[2])
    return ans

@app.post("api/v2/uploadfile")
async def upload(req: Request):
    data = await req.form()
    classes = classes_parsing(data)
    option = option_parsing(data)
    file = data['file']
    contents = await file.read()
    f = open('./data/test.jpg', 'wb')
    f.write(contents)
    await file.close()

    # TODO: WRITE FUNCTION TO USE IMAGE ROTATION THAT RETURN THE COORDINATES OF THE OBJECT
    image_rotation('test.jpg', './data/test.jpg')
    # TODO: RE-WRITE THE FUNCTION TO EVALUATE THE BOUNDINGBOX USING THE COORDINATES
    ans = objectDetectionMultiple(classes, option)
    print(ans)
    bbp = BoundingBoxProcessing(option)
    ans = bbp.detect_rotated(ans[0],ans[1],ans[2], option, json=True)
    return ans