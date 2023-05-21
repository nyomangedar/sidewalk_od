# Navigating Application For Visually Impaired User

Cloning the code
====

There are two main source code for developing the application, first are the application source code and second is the scaled YOLOv4 source code by AlexeyAB.

1. [The project repository](https://git.cs.bham.ac.uk/projects-2022-23/ixm138)
2. [Scaled YOLOv4 repository](https://github.com/AlexeyAB/darknet)

System Environment Setup
====
The development process are done in Windows and Mac operating system and it is mainly develop using C, Python, Javascript. Make sure your environment have access to those tools. Before running the application there are several dependencies that need to be installed first. The dependencies for the application source code will be different with the model source code. .


### **Application Dependencies**

For running the mobile application your environment need to have:

1. FastAPI
2. OpenCV
3. Matplotlib
4. Scipy
5. React Native Expo
6. Emulator (if you want to run the application with emulator)
7. NPM
8. Yarn

### **Model Dependencies**

The repository of the model provides guide on how to setup the environment to run the application, please refer to it. The dependencies that the project used to train and use the model are:

1. CUDA
2. cuDNN
3. OpenCV
4. CMake
5. MSVC
6. Numpy

Running the Application
====
### **Frontend**
In the application repository directory, the frontend source code can be found under the mobapp directory. These are the steps to run the frontend:

1. Navigate to the frontend root folder
2. Run `npx expo install`
3. Initialise the emulator
4. Run `npx expo start`

### **Backend**
The backend source code can be found under the backend directory. Before running the server, configuration need to be made to the source code. The configuration are:

1. Move the files under the backend directory to the model root directory

2. Configure the command in line 60 with the data from the application repo. The application repo provides the component that is trained from the project. Those component are:
    
    * Object data, under the path: model/data
    * Model configuration, under the path: model/cfg
    * Model weights, by downloading trough this [link](https://bham-my.sharepoint.com/personal/ixm138_student_bham_ac_uk/_layouts/15/guestaccess.aspx?guestaccesstoken=oh6WlsH7ap2c8HTXInp9WJrDqLtmR%2FktkwXKwOxj0Go%3D&folderid=2_08d002d540bb94ddd8e8d63d609d86dfe&rev=1&e=z8YyDg) using the university campus email

You can run the server after completing the configuration. Command to run the server locally:

`uvicorn server:app (--host:IPADDRES) (--reload)`

words inside () are optional parameter to run the server. 

1. `--host:IPADDRESS` 
    
    This parameter will run the server under the specified IP address, this could be usefull if you want the server to be accessible within the local connection

2. `--reload`

    This parameter allow the server to be reloaded automatically everytime there's a change within the source code


Running the Model
===
Setup and configuration are specified in the README file inside the model repository. You need to follow the steps to setup the model in order to run the detection model. 

The application repository provide configuration files that the project use. You need to use this configuration file in order to use the trained model based on the project. 

To use the configuration files just copy and paste the folders under the model directory to your model directory path.



