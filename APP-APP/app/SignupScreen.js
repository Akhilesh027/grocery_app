import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "", // 👈 Added
  });

  const handleSignup = async () => {
    const { name, email, password, referralCode } = form;

    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("https://grocery-c3c0.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode }), // 👈 Send referralCode too
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          "Signup successful! 🎉",
          [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }],
          { cancelable: false }
        );
      } else {
        Alert.alert("Error", data.message || "Signup failed. Try again!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={form.name}
        onChangeText={(name) => setForm({ ...form, name })}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChangeText={(email) => setForm({ ...form, email })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={form.password}
        onChangeText={(password) => setForm({ ...form, password })}
      />

      {/* ✅ Optional Referral Code */}
      <TextInput
        placeholder="Referral Code (optional)"
        style={styles.input}
        value={form.referralCode}
        onChangeText={(referralCode) => setForm({ ...form, referralCode })}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          Login
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00A86B",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#00A86B",
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: "#00A86B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    color: "#333",
  },
  linkText: {
    color: "#00A86B",
    fontWeight: "bold",
  },
});
