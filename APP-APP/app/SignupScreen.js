import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignupScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    referralCode: "",
    otp: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const API_BASE_URL = "http://31.97.233.212:5000/api";

  // ✅ Gmail-only regex
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  // OTP Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // ✅ Check Email Availability (Gmail only)
  const checkEmailAvailability = async () => {
    if (!form.email) return;

    if (!gmailRegex.test(form.email)) {
      Alert.alert(
        "Invalid Email",
        "Only Gmail addresses are allowed (example@gmail.com)"
      );
      setForm((prev) => ({ ...prev, email: "" }));
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(`${API_BASE_URL}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();

      if (!data.available) {
        Alert.alert("Error", "Email already registered");
        setForm((prev) => ({ ...prev, email: "" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Check Mobile Availability
  const checkMobileAvailability = async () => {
    if (!form.mobile || form.mobile.length !== 10) return;

    setCheckingAvailability(true);
    try {
      const response = await fetch(`${API_BASE_URL}/check-mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      });

      const data = await response.json();

      if (!data.available) {
        Alert.alert("Error", "Mobile number already registered");
        setForm((prev) => ({ ...prev, mobile: "" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // ✅ Validate Form
  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }

    if (!gmailRegex.test(form.email)) {
      Alert.alert(
        "Invalid Email",
        "Only Gmail addresses are allowed (example@gmail.com)"
      );
      return false;
    }

    if (form.mobile.length !== 10) {
      Alert.alert("Error", "Enter a valid 10-digit mobile number");
      return false;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // Send OTP
  const sendOTP = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: form.mobile }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert("Success", "OTP sent successfully");
        setStep(2);
        setTimer(60);
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (err) {
      Alert.alert("Error", "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (form.otp.length !== 4) {
      Alert.alert("Error", "Enter 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.mobile,
          otp: form.otp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await handleSignup();
      } else {
        Alert.alert("Error", "Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Final Signup + Auto Login
  const handleSignup = async () => {
    setLoading(true);
    try {
      const registerRes = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mobileVerified: true,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        Alert.alert("Error", registerData.message || "Signup failed");
        return;
      }

      const loginRes = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();

      await AsyncStorage.setItem("token", loginData.token);
      await AsyncStorage.setItem("user", JSON.stringify(loginData.user));

      Alert.alert(
        "Welcome",
        `Account created successfully!\nReferral Code: ${loginData.user.referralCode}`,
        [{ text: "Continue", onPress: () => navigation.navigate("index") }]
      );
    } catch (err) {
      Alert.alert("Error", "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupProcess = () => {
    step === 1 ? sendOTP() : verifyOTP();
  };

  const resendOTP = () => {
    if (timer > 0) return;
    sendOTP();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <Text style={styles.title}>Create Account</Text>

        {step === 1 ? (
          <>
            <TextInput
              placeholder="Full Name *"
              style={styles.input}
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
            />

            <TextInput
              placeholder="Gmail Address * (example@gmail.com)"
              style={styles.input}
              value={form.email}
              onChangeText={(email) =>
                setForm({ ...form, email: email.toLowerCase() })
              }
              onBlur={checkEmailAvailability}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Mobile Number *"
              style={styles.input}
              value={form.mobile}
              onChangeText={(mobile) => setForm({ ...form, mobile })}
              onBlur={checkMobileAvailability}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <TextInput
              placeholder="Password *"
              secureTextEntry
              style={styles.input}
              value={form.password}
              onChangeText={(password) => setForm({ ...form, password })}
            />

            <TextInput
              placeholder="Referral Code (optional)"
              style={styles.input}
              value={form.referralCode}
              onChangeText={(referralCode) =>
                setForm({ ...form, referralCode })
              }
            />

            <TouchableOpacity style={styles.button} onPress={handleSignupProcess}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>SEND OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="Enter OTP"
              style={styles.input}
              value={form.otp}
              onChangeText={(otp) => setForm({ ...form, otp })}
              keyboardType="number-pad"
              maxLength={4}
            />

            <TouchableOpacity onPress={resendOTP}>
              <Text style={styles.resend}>
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSignupProcess}>
              <Text style={styles.buttonText}>VERIFY & SIGN UP</Text>
            </TouchableOpacity>
          </>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  checkIndicator: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  linkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  otpSubtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
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
    marginBottom: 20,
  },
  otpActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  resendText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#ccc",
  },
  changeNumberText: {
    color: "#666",
  },
});