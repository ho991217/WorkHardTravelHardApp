import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors";
import AsnyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const work = () => {
    setWorking(true);
    AsnyncStorage.setItem("working", "true");
  };
  const travel = () => {
    setWorking(false);
    AsnyncStorage.setItem("working", "false");
  };
  const onChangeText = (payload) => {
    setText(payload);
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text, working, completed: false },
    });
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("삭제하시겠습니까?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    }
    Alert.alert("투두 삭제", "삭제 하시겠습니까?", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const saveToDos = async (toSave) => {
    try {
      await AsnyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      alert(error);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsnyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setToDos(JSON.parse(s));
      }
      const isWork = await AsnyncStorage.getItem("working");
      if (isWork) {
        setWorking(JSON.parse(isWork));
      } else {
        setWorking(true);
      }

      setLoading(false);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          placeholder={working ? "Add Todo" : "Where do you want to go?"}
          value={text}
          style={styles.input}
          onChangeText={onChangeText}
          returnKeyType="done"
          autoCapitalize={working ? "none" : "words"}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <TouchableOpacity
                activeOpacity="0.75"
                style={styles.toDo}
                key={key}
                onPress={() => {
                  completeToDo(key);
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      deleteToDo(key);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={24}
                      color={theme.grey}
                      style={styles.deleteIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <MaterialIcons
                      name="edit"
                      size={24}
                      color={theme.grey}
                      style={styles.editIcon}
                    />
                  </TouchableOpacity>

                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: toDos[key].completed
                        ? "line-through"
                        : "none",
                      color: toDos[key].completed ? theme.grey : "white",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                </View>

                <Text style={styles.tag}>
                  {toDos[key].working === true ? "WORK" : "TRAVEL"}
                </Text>
              </TouchableOpacity>
            ) : null
          )}
        </ScrollView>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          copyright &copy; {new Date().getFullYear()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginVertical: 30,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toDoText: {
    fontSize: 16,
  },
  tag: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
  },
  deleteIcon: {
    marginLeft: -10,
    marginRight: 5,
  },
  editIcon: {
    marginRight: 10,
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 35,
  },
  footerText: {
    color: "rgba(255,255,255,0.3)",
  },
});
