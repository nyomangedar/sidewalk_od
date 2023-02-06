from fastapi import FastAPI, File, UploadFile
import os
import re

app = FastAPI()

@app.get("/test")
def hello():
    return {"Hello World"}

@app.get("/darknet")
def darknetTest():
    os.system("darknet.exe detector test cfg/openimages.data cfg/yolov3-openimages.cfg yolov3-openimages.weights -ext_output data/example4.jpeg -thresh 0.10 -dont_show > resultbbox.txt")
    f = open("resultbbox.txt", "r")
    result = f.readlines()[12:]
    bbox = []
    for i in result:
        x = re.search("\(", i)
        if x == None:
            bbox.append(i)

    return bbox


def objectDetection(filename):
    os.system(f"darknet.exe detector test cfg/openimages.data cfg/yolov3-openimages.cfg yolov3-openimages.weights -ext_output data/{filename} -thresh 0.10 -dont_show > resultbbox.txt")
    f = open("resultbbox.txt", "r")
    result = f.readlines()[11:]
    bbox = []
    for i in result:
        x = re.search("\(", i)
        # print(x)
        if x != None:
            bbox.append(i)

    return bbox
    
@app.post("/uploadfile")
async def upload(file: UploadFile =File(...)):
    try:
        contents = await file.read()
        filename = file.filename
        f = open('./data/'+filename, 'wb')
        f.write(contents)
        await file.close()
        bbox = objectDetection(filename)

    except Exception as e:
        return {"message":f"Error: {str(e)}"}
    finally:
        return bbox

    
    
    
    

