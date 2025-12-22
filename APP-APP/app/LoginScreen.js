import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    mobile: "",
    otp: "",
  });
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'mobile'
  const [step, setStep] = useState(1); // For mobile login: 1 = enter mobile, 2 = enter OTP
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // API Base URL
  const API_BASE_URL = "http://31.97.233.212:5000/api";

  // Timer effect for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Email/Password Login
  const handleEmailLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user details
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("userId", data.user._id);
        await AsyncStorage.setItem("userName", data.user.name);
        await AsyncStorage.setItem("userEmail", data.user.email);
        await AsyncStorage.setItem("userMobile", data.user.mobile);
        await AsyncStorage.setItem("referralCode", data.user.referralCode || "");
        await AsyncStorage.setItem(
          "loyaltyCoins",
          data.user.loyaltyCoins?.toString() || "0"
        );

        Alert.alert("Welcome", `Logged in as ${data.user.name}`);
        navigation.navigate("index");
      } else {
        Alert.alert("Error", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for mobile login
  const sendMobileOTP = async () => {
    if (!form.mobile || form.mobile.length < 10) {
      Alert.alert("Error", "Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/login/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: form.mobile }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", "OTP sent to your mobile number");
        setStep(2);
        setTimer(60); // Start 60-second timer
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOTP = async () => {
    if (!form.otp || form.otp.length < 4) {
      Alert.alert("Error", "Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/login/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: form.mobile,
            otp: form.otp,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user details
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("userId", data.user._id);
        await AsyncStorage.setItem("userName", data.user.name);
        await AsyncStorage.setItem("userEmail", data.user.email);
        await AsyncStorage.setItem("userMobile", data.user.mobile);
        await AsyncStorage.setItem("referralCode", data.user.referralCode || "");
        await AsyncStorage.setItem(
          "loyaltyCoins",
          data.user.loyaltyCoins?.toString() || "0"
        );

        Alert.alert("Welcome", `Logged in as ${data.user.name}`);
        navigation.navigate("index");
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle login based on method
  const handleLogin = async () => {
    if (loginMethod === "email") {
      await handleEmailLogin();
    } else {
      if (step === 1) {
        await sendMobileOTP();
      } else {
        await verifyMobileOTP();
      }
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (timer > 0) {
      Alert.alert(
        "Wait",
        `Please wait ${timer} seconds before requesting a new OTP`
      );
      return;
    }
    await sendMobileOTP();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.welcome}>Welcome,</Text>
        <Text style={styles.subtitle}>Sign in to Continue</Text>

        {/* Login Method Toggle */}
        <View style={styles.methodToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              loginMethod === "email" && styles.toggleActive,
            ]}
            onPress={() => {
              setLoginMethod("email");
              setStep(1);
            }}
            disabled={loading}
          >
            <Text
              style={[
                styles.toggleText,
                loginMethod === "email" && styles.toggleTextActive,
              ]}
            >
              Email Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              loginMethod === "mobile" && styles.toggleActive,
            ]}
            onPress={() => {
              setLoginMethod("mobile");
              setStep(1);
              setForm({ ...form, email: "", password: "", otp: "" });
            }}
            disabled={loading}
          >
            <Text
              style={[
                styles.toggleText,
                loginMethod === "mobile" && styles.toggleTextActive,
              ]}
            >
              Mobile Login
            </Text>
          </TouchableOpacity>
        </View>

        {loginMethod === "email" ? (
          // Email Login Form
          <>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={form.email}
              onChangeText={(email) => setForm({ ...form, email })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              value={form.password}
              onChangeText={(password) => setForm({ ...form, password })}
              editable={!loading}
            />
          </>
        ) : (
          // Mobile Login Form
          <>
            {step === 1 ? (
              <>
                <TextInput
                  placeholder="Mobile Number"
                  style={styles.input}
                  value={form.mobile}
                  onChangeText={(mobile) => setForm({ ...form, mobile })}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
                <Text style={styles.mobileHint}>
                  We'll send an OTP to this number
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.otpTitle}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>
                  Sent to +91 {form.mobile}
                </Text>
                <TextInput
                  placeholder="Enter 4-digit OTP"
                  style={styles.otpInput}
                  value={form.otp}
                  onChangeText={(otp) => setForm({ ...form, otp })}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus
                  editable={!loading}
                />
                <TouchableOpacity onPress={resendOTP} disabled={timer > 0 || loading}>
                  <Text style={[styles.resendText, (timer > 0 || loading) && styles.resendDisabled]}>
                    {timer > 0
                      ? `Resend OTP in ${timer}s`
                      : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={styles.changeNumberButton}
                  disabled={loading}
                >
                  <Text style={styles.changeNumberText}>
                    Change Mobile Number
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {loginMethod === "email"
                ? "SIGN IN"
                : step === 1
                ? "SEND OTP"
                : "VERIFY & SIGN IN"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>- OR -</Text>

        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Text>Sign In with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Text>Sign In with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignupScreen")}
          style={styles.signupLink}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  methodToggle: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#007AFF",
  },
  toggleText: {
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  mobileHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  otpSubtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontSize: 14,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 10,
  },
  resendText: {
    textAlign: "center",
    color: "#007AFF",
    marginBottom: 15,
  },
  resendDisabled: {
    color: "#ccc",
  },
  changeNumberButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  changeNumberText: {
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  or: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  signupLink: {
    marginTop: 30,
    alignItems: "center",
  },
  signupText: {
    color: "#007AFF",
    fontWeight: "500",
  },
});