import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    Button,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import CheckBox from "expo-checkbox";
import { Camera, CameraType } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useInterval } from "usehooks-ts";
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
    const [options, setOptions] = useState(null)
    const [settingTrigger, setSettingTrigger] = useState(false)
    let loop;


    const request = async (file) => {
        let res
        const photo = {
            name: "test.jpg",
            uri: file,
            type: 'image/png',
        }
        const form = new FormData()
        form.append('file', photo)
        await fetch("http://192.168.0.21:8000/uploadfile", {
            method:'POST',
            body: form,
            headers:{
                'Content-Type':"multipart/form-data"
            }
        }).then((res) => res.json()).then((resData) => {res = resData})
        return res

    }
    const setupCamera = async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === "granted");
    };

    const speak = (data) => {
        if (data === 'none'){
            return
        }
        Speech.speak(data, {
            pitch: 1,
        });
    };

    const beginCapture = async () => {
        if(capture){
            speak("Stop Capturing Image")
            setData("")
        }
        else{
            speak("Begin Capturing Image")
        }
        setCapture(!capture)
    }

    const captureFunction = async () => {
        if (capture) {
            if (waiting === true){return}
            const image = await takePicture()
            console.log({waiting})
            const data = await request(image.uri)
            if(data){
                if(data !== "\"none\""){
                    speak(data)
                }
                setData(data)
                setWaiting(false)
            }
            
        }
    };

    useInterval(()=>{
        captureFunction()

    }, capture? 5000 : null)

    useEffect(() => {
        setupCamera();
    }, []);


    const takePicture = async () => {
        if (cameraRef) {
            try {
                console.log("start test");
                setWaiting(true)
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
        } else if (data === "\"none\""){
            return "Path is clear";
        } 
        else {
            return "Loading...";
        }
    };

    if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    }
    return (
        <View style={styles.container}>
            {!settingTrigger ? (
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
                >
                    <View style={styles.topButtonContainer}>
                    <TouchableOpacity style={styles.settingButton} onPress={()=> setSettingTrigger(true)}>
                        <Text style={{color:"#fff"}}>Settings</Text>
                    </TouchableOpacity>
                    </View>
                    {/* <Button title="Settings"/> */}
                    
                </Camera>
            ) : (
                <View style={styles.settingContainer}>
                    <CheckBox />
                    <Text>INI SETTING</Text>
                </View>
                
            )}
            
            <View style={styles.buttonContainer}>
            
                <Text>{capture && message()}</Text>
                <Button
                    title="begin capture"
                    onPress={() => beginCapture()}
                    // onPress={speak}
                 />
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
    topButtonContainer:{
        // flexDirection: 'row',
        marginTop:40,
        paddingHorizontal: 20,
        alignItems: 'flex-end'
    },
    settingButton: {
        height: 40,
        justifyContent: 'center',
        backgroundColor:'blue',
    }
});
