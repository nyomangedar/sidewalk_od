from fastapi import FastAPI, File, UploadFile
import os
import re
from boundingbox_processing import BoundingBoxProcessing


app = FastAPI()


@app.get("/darknet")
def darknetTest():
    os.system("darknet.exe detector test cfg/openimages.data cfg/yolov3-openimages.cfg yolov3-openimages.weights -ext_output data/example4.jpeg -thresh 0.10 -dont_show > resultbbox.txt")
    f = open("resultbbox.txt", "r")
    result = f.readlines()[12:]
    bbox = ""
    for i in result:
        x = re.search("\(", i)
        if x == None:
            bbox += i

    return bbox


def objectDetection(filename):
    os.system(f"darknet.exe detector test cfg/openimages.data cfg/yolov3-openimages.cfg yolov3-openimages.weights -ext_output data/{filename} -thresh 0.10 -dont_show > resultbbox.txt")
    f = open("resultbbox.txt", "r")
    result = f.read()
    result = bboxProperties(result)
    f.close()
    return result

def bboxProperties(s):
    pattern = "\(left_x:\s+(\d+)\s+top_y:\s+(\d+)\s+width:\s+(\d+)\s+height:\s+(\d+)"
    return re.findall(pattern, s)
    
@app.post("/uploadfile")
async def upload(file: UploadFile =File(...)):
    contents = await file.read()
    filename = file.filename
    f = open('./data/'+filename, 'wb')
    f.write(contents)
    await file.close()
    bbox = objectDetection(filename)
    bbp = BoundingBoxProcessing()
    violations = bbp.detect(bbox)
    return violations



# @app.get('/test')
# async def test():
#     s = """
#     "Vehicle: 54%\t(left_x:    3   top_y: 1151   width:  291   height:  320)\n",
#     "Land vehicle: 43%\t(left_x:    3   top_y: 1151   width:  291   height:  320)\n",
#     "Car: 36%\t(left_x:    3   top_y: 1151   width:  291   height:  320)\n",
#     "Vehicle: 89%\t(left_x:    3   top_y: 1201   width: 1365   height:  810)\n",
#     "Land vehicle: 59%\t(left_x:    3   top_y: 1201   width: 1365   height:  810)\n",
#     "Car: 53%\t(left_x:    3   top_y: 1201   width: 1365   height:  810)\n",
#     "Vehicle: 69%\t(left_x:    3   top_y: 1433   width:  736   height: 2517)\n",
#     "Land vehicle: 46%\t(left_x:    3   top_y: 1433   width:  736   height: 2517)\n",
#     "Car: 45%\t(left_x:    3   top_y: 1433   width:  736   height: 2517)\n",
#     "Wheel: 18%\t(left_x:   59   top_y: 1355   width:   62   height:  104)\n",
#     "Wheel: 15%\t(left_x:  240   top_y: 1325   width:   45   height:   90)\n",
#     "Wheel: 43%\t(left_x:  493   top_y: 2204   width:  221   height:  640)\n",
#     "Tire: 19%\t(left_x:  493   top_y: 2204   width:  221   height:  640)\n",
#     "Wheel: 15%\t(left_x:  929   top_y: 1717   width:  117   height:  313)\n",
#     "Vehicle: 12%\t(left_x:  945   top_y: 1133   width:  382   height:  389)\n",
#     "Land vehicle: 11%\t(left_x:  945   top_y: 1133   width:  382   height:  389)\n",
#     "Wheel: 15%\t(left_x: 1111   top_y: 1569   width:   73   height:  203)\n",
#     "Vehicle: 12%\t(left_x: 1423   top_y: 1116   width:   67   height:   55)\n",
#     "Tool: 19%\t(left_x: 1670   top_y: 1398   width: 1384   height: 2475)\n"
#     """
#     coordinates = bboxProperties(s)
#     # print(coordinates)
    
#     bbp = BoundingBoxProcessing()
#     answer = bbp.detect(coordinates)
#     return answer
#     # return answer
    
    
    
    

