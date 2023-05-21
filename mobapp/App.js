import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Switch,
    ScrollView,
    TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import CheckBox from "expo-checkbox";
import { Camera, CameraType } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons, EvilIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useInterval } from "usehooks-ts";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import placeHolder from "./assets/withoutcoordinate.jpg";
import { Asset, useAssets } from "expo-asset";
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
    const [settingTrigger, setSettingTrigger] = useState(false);
    // const [assets, error] = useAssets([require("./assets/withoutcoordinate.jpg")])

    const [optionsData, setOptionsData] = useState({
        save: false,
        danger: true,
        alert: true,
        objectName: false,
        bicycle: true,
        car: true,
        fireHydrant: true,
        furniture: true,
        tree: true,
        wasteContainer: true,
        streetLight: true,
        threshold: 0.7,
    });

    const onChange = (key, value) => {
        setOptionsData((prevState) => ({
            ...prevState,
            [key]: value,
        }));
        console.log(optionsData);
    };

    const request = async (file) => {
        let res;
        const photo = {
            name: "test.jpg",
            uri: file,
            type: "image/png",
        };

        const form = new FormData();
        // await form.append("option", optionsData);
        let options = Object.keys(optionsData);
        options.forEach((option) => {
            form.append(option, optionsData[option]);
        });

        form.append("file", photo);

        console.log(form);
        await fetch("http://172.22.228.93:8000/uploadfile", {
            method: "POST",
            body: form,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then((res) => res.json())
            .then((resData) => {
                res = resData;
            });
        return res;
    };
    const setupCamera = async () => {
        const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus.status === "granted");
    };

    const speak = (data) => {
        if (data === "none") {
            return;
        }
        Speech.speak(data, {
            pitch: 1,
        });
    };

    const beginCapture = async () => {
        if (capture) {
            speak("Stop Capturing Image");
            setData("");
        } else {
            speak("Begin Capturing Image");
        }
        setCapture(!capture);
    };

    const captureFunction = async () => {
        if (capture) {
            if (waiting === true) {
                return;
            }
            const image = await takePicture();
            console.log({ waiting });
            const data = await request(image.uri);
            if (data) {
                if (data !== '"none"') {
                    speak(data);
                }
                setData(data);
                setWaiting(false);
            }
        }
    };

    useInterval(
        () => {
            captureFunction();
        },
        capture ? 5000 : null
    );

    useEffect(() => {
        setupCamera();
    }, []);

    const takePicture = async () => {
        if (cameraRef) {
            try {
                console.log("start test");
                setWaiting(true);
                const image = await cameraRef.current.takePictureAsync();
                if (optionsData.save) {
                    console.log(image.uri);
                    await MediaLibrary.saveToLibraryAsync(image.uri);
                }
                return image;
            } catch (error) {
                console.log(error);
            }
        }
    };

    const message = () => {
        if (data.length !== 0) {
            return data;
        } else if (data === '"none"') {
            return "Path is clear";
        } else {
            return "Loading...";
        }
    };

    if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    }
    return (
        <View style={styles.container}>
            {!settingTrigger ? (
                <>
                    <Camera
                        style={[
                            styles.camera,
                            {
                                // marginBottom: 180,
                                maxHeight: 510,
                            },
                        ]}
                        type={type}
                        ratio={"4:3"}
                        ref={cameraRef}
                    >
                        {/* <Image
                            source={require("./assets/test_image.jpg")}
                            style={{ width: 400, height: 510 }}
                        /> */}

                        <View style={styles.topButtonContainer}>
                            <TouchableOpacity
                                style={styles.settingButton}
                                onPress={() => setSettingTrigger(true)}
                            >
                                <EvilIcons
                                    name="gear"
                                    size={40}
                                    color={"#fff"}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* <Button title="Settings"/> */}
                    </Camera>

                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 10,
                            paddingTop: 7,
                        }}
                    >
                        <View
                            style={[
                                styles.lineProperties,
                                {
                                    left: -24,
                                    borderColor: "red",
                                    width: 338,
                                },
                                { transform: [{ rotate: "107.6deg" }] },
                            ]}
                        />

                        <View
                            style={[
                                styles.lineProperties,
                                {
                                    left: 80,
                                    borderColor: "red",
                                    width: 338,
                                },
                                { transform: [{ rotate: "72.45deg" }] },
                            ]}
                        />

                        <View
                            style={[
                                styles.lineProperties,
                                {
                                    left: 1,
                                    borderColor: "yellow",
                                    width: 328,
                                },
                                { transform: [{ rotate: "101.07deg" }] },
                            ]}
                        />

                        <View
                            style={[
                                styles.lineProperties,
                                {
                                    left: 65,
                                    borderColor: "yellow",
                                    width: 328,
                                },
                                { transform: [{ rotate: "78.93deg" }] },
                            ]}
                        />

                        <Text
                            style={[
                                styles.mediumText,
                                { paddingBottom: 3, textAlign: "center" },
                            ]}
                        >
                            {capture
                                ? message()
                                : "Align your camera to the walking path area"}
                        </Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={
                                    capture
                                        ? [
                                              styles.confirmButton,
                                              {
                                                  borderColor: "red",
                                              },
                                          ]
                                        : styles.confirmButton
                                }
                                onPress={() => beginCapture()}
                                // onPress={speak}
                            >
                                <Text
                                    style={
                                        capture
                                            ? [
                                                  styles.mediumText,
                                                  { color: "red" },
                                              ]
                                            : styles.mediumText
                                    }
                                >
                                    {capture ? "Stop Capture" : "Begin Capture"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.settingContainer}>
                        <View style={styles.mainSetting}>
                            <Text style={styles.largeText}>
                                General Settings
                            </Text>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Save Image
                                </Text>
                                <Switch
                                    onValueChange={() =>
                                        onChange("save", !optionsData.save)
                                    }
                                    name="save"
                                    value={optionsData.save}
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Danger Information
                                </Text>
                                <Switch
                                    onValueChange={() =>
                                        onChange("danger", !optionsData.danger)
                                    }
                                    name="danger"
                                    value={optionsData.danger}
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Alert Information
                                </Text>
                                <Switch
                                    onValueChange={() =>
                                        onChange("alert", !optionsData.alert)
                                    }
                                    value={optionsData.alert}
                                    name="alert"
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Object Name
                                </Text>
                                <Switch
                                    onValueChange={() =>
                                        onChange(
                                            "objectName",
                                            !optionsData.objectName
                                        )
                                    }
                                    value={optionsData.objectName}
                                    name="objectName"
                                />
                            </View>
                            <View
                                style={[
                                    styles.optionContainer,
                                    {
                                        flexDirection: "column",
                                        paddingTop: 7,
                                        height: 70,
                                    },
                                ]}
                            >
                                <Text style={styles.mediumText}>Threshold</Text>
                                <Text>{optionsData.threshold}</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={optionsData.threshold}
                                    step={0.05}
                                    onValueChange={(threshold) =>
                                        onChange(
                                            "threshold",
                                            parseFloat(threshold.toPrecision(2))
                                        )
                                    }
                                />
                            </View>
                        </View>

                        <View style={styles.mainSetting}>
                            <Text style={styles.largeText}>Object Class</Text>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>Bicycle</Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange(
                                            "bicycle",
                                            !optionsData.bicycle
                                        )
                                    }
                                    name="bicycle"
                                    value={optionsData.bicycle}
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>Car</Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange("car", !optionsData.car)
                                    }
                                    value={optionsData.car}
                                    name="car"
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Fire hydrant
                                </Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange(
                                            "fireHydrant",
                                            !optionsData.fireHydrant
                                        )
                                    }
                                    value={optionsData.fireHydrant}
                                    name="fireHydrant"
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>Furniture</Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange(
                                            "furniture",
                                            !optionsData.furniture
                                        )
                                    }
                                    value={optionsData.furniture}
                                    name="furniture"
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>Tree</Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange("tree", !optionsData.tree)
                                    }
                                    value={optionsData.tree}
                                    name="tree"
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Waste Container
                                </Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange(
                                            "wasteContainer",
                                            !optionsData.wasteContainer
                                        )
                                    }
                                    value={optionsData.wasteContainer}
                                    name="wasteContainer"
                                />
                            </View>
                            <View style={styles.optionContainer}>
                                <Text style={styles.mediumText}>
                                    Street Light
                                </Text>
                                <CheckBox
                                    onValueChange={() =>
                                        onChange(
                                            "streetLight",
                                            !optionsData.streetLight
                                        )
                                    }
                                    value={optionsData.streetLight}
                                    name="streetLight"
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.confirmButtonContainer}>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => setSettingTrigger(false)}
                        >
                            <Text style={styles.mediumText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
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
        paddingTop: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    topButtonContainer: {
        // flexDirection: 'row',
        marginTop: 20,
        paddingHorizontal: 20,
        alignItems: "flex-end",
    },
    settingButton: {
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    settingContainer: {
        marginTop: 40,
        paddingHorizontal: 10,
        flexDirection: "column",
        flex: 1,
    },
    confirmButton: {
        height: 50,
        width: 150,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: 20,
        // backgroundColor: "blue",
    },
    confirmButtonContainer: {
        marginBottom: 30,
        // width: 500,
        alignItems: "center",
    },
    optionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignContent: "center",
        width: "100%",
        height: 50,
        // backgroundColor: "blue",
        borderTopWidth: 1,
        marginBottom: 10,
        borderColor: "#8F8F8F",
    },
    largeText: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
    },
    mediumText: {
        fontSize: 17,
    },
    smallText: {
        fontSize: 16,
    },
    lineProperties: {
        // borderColor: "red",
        height: 0,
        // width: 328,
        borderWidth: 1,
        position: "absolute",
        top: -162,
    },
    mainSetting: {
        backgroundColor: "#D9D9D9",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 9,
        marginBottom: 10,
    },
    slider: {
        width: 330,
        height: 20,
    },
});
