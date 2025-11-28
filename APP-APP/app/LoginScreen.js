import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      const response = await fetch("https://grocery-c3c0.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Store token and user details in AsyncStorage
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem("userId", data.user._id);
        await AsyncStorage.setItem("userName", data.user.name);

        Alert.alert("Welcome", `Logged in as ${data.user.name}`);

        // ✅ Navigate to home or index screen
        navigation.navigate("index");
      } else {
        Alert.alert("Error", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome,</Text>
      <Text style={styles.subtitle}>Sign in to Continue</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChangeText={(email) => setForm({ ...form, email })}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={form.password}
        onChangeText={(password) => setForm({ ...form, password })}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>SIGN IN</Text>
      </TouchableOpacity>

      <Text style={styles.or}>- OR -</Text>

      <TouchableOpacity style={styles.socialButton}>
        <Text>Sign In with Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton}>
        <Text>Sign In with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
        <Text style={styles.signupLink}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" },
  welcome: { fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "gray", marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    borderColor: "#4CAF50",
    marginBottom: 20,
    fontSize: 16,
    padding: 10,
  },
  button: {
    backgroundColor: "#00A86B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  or: { textAlign: "center", marginVertical: 20 },
  socialButton: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  signupLink: { textAlign: "center", color: "#00A86B", marginTop: 10 },
});
