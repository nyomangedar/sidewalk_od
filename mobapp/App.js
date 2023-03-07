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
// import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";

export default function App() {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [image, setImage] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const [data, setData] = useState("");
    const [capture, setCapture] = useState(false);
    const cameraRef = useRef(null);
    const { height, width } = Dimensions.get("window");
    let loop;

    const setupCamera = async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === "granted");
    };

    const beginCapture = async () => {
        if (capture) {
            console.log("Start Request");
            console.log(image);
            await fetch("https://jsonplaceholder.typicode.com/posts/1", {
                method: "POST",
            })
                .then((response) => response.json())
                .then((json) => setData(json));
        }
    };

    const loopFunction = () => {
        loop = setInterval(async () => {
            // console.log(capture);

            await takePicture();

            await beginCapture();
            console.log("finish one request");
        }, 1000);
        if (capture === false) {
            clearInterval(loop);
        }
    };
    useEffect(() => {
        loopFunction();
        return () => {
            clearInterval(loop);
        };
    }, [capture]);

    useEffect(() => {
        setupCamera();
    }, []);

    const takePicture = async () => {
        if (cameraRef) {
            try {
                console.log("start test");
                const image = await cameraRef.current.takePictureAsync();
                setImage(image);
                console.log("test" + image);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const speak = () => {
        Speech.speak(data, {
            pitch: 1,
        });
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
                    // onPress={() => setCapture(!capture)}
                    onPress={speak}
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
