import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    Button,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system"
// import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";

export default function App() {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [waiting, setWaiting] = useState(false);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const [data, setData] = useState("");
    const [capture, setCapture] = useState(false);
    const cameraRef = useRef(null);
    const { height, width } = Dimensions.get("window");
    let loop;


    const request = async (file) => {
        const res = await FileSystem.uploadAsync(
            "http://192.168.0.21:8000/uploadfile",
            file,
            {
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
              fieldName: 'file',
              mimeType: 'image/png',
            });
        console.log("didalem request",{waiting})
        return res.body

    }
    const setupCamera = async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === "granted");
    };

    const speak = (data) => {
        Speech.speak(data, {
            pitch: 1,
        });
    };

    const beginCapture = async () => {
        if(capture){
            speak("Stop Capturing Image")
        }
        else{
            speak("Begin Capturing Image")
        }
        setCapture(!capture)
        // const image = await takePicture()
        // const test =  await request(image.uri, test)
        // console.log(test)
       
    }

    const captureFunction = async () => {
        if (capture) {
            if (waiting === true){return}
            const image = await takePicture()
            console.log({waiting})
            const data = await request(image.uri)
            if(data){
                console.log(data)
                speak(data)
                setData(data)
                setWaiting(false)
            }
            
        }
    };

    const loopFunction = async () => {
       loop = setInterval(async () => {
            // console.log(capture);
            await captureFunction();
            console.log("finish one request");
        }, 5000);
        if (capture === false) {
            clearInterval(loop);
        }
    };
    useEffect(() => {
        loopFunction();
        return () => {
            clearInterval(loop);
            setData("")
        };
    }, [capture]);

    useEffect(() => {
        setupCamera();
    }, []);


    const takePicture = async () => {
        if (cameraRef) {
            try {
                console.log("start test");
                setWaiting(true)
                console.log("waiting di picture", waiting)
                const image = await cameraRef.current.takePictureAsync();
                return image
            } catch (error) {
                console.log(error);
            }
        }
    };

    

    const message = () => {
        if (data.length !== 0) {
            return data;
        } else {
            return "Loading...";
        }
    };

    if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    }
    return (
        <View style={styles.container}>
            <Camera
                style={[
                    styles.camera,
                    {
                        marginBottom: height - (4 / 3) * width,
                    },
                ]}
                type={type}
                ratio={"4:3"}
                ref={cameraRef}
            ></Camera>
            <View style={styles.buttonContainer}>
                <Text>{capture && message()}</Text>
                <Button
                    title="begin capture"
                    onPress={() => beginCapture()}
                    // onPress={speak}
                >
                    Begin
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    camera: {
        flex: 5,
    },
    buttonContainer: {
        flex: 1,
    },
});
