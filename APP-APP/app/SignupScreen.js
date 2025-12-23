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

  const API_BASE_URL = "https://api.sampurnamart.cloud/api";

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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? "Fill in your details to get started" 
              : "Enter the OTP sent to your mobile"}
          </Text>
        </View>

        {step === 1 ? (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                style={styles.input}
                value={form.name}
                onChangeText={(name) => setForm({ ...form, name })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                placeholder="example@gmail.com"
                placeholderTextColor="#999"
                style={styles.input}
                value={form.email}
                onChangeText={(email) =>
                  setForm({ ...form, email: email.toLowerCase() })
                }
                onBlur={checkEmailAvailability}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.hintText}>Only Gmail addresses allowed</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                placeholder="10-digit mobile number"
                placeholderTextColor="#999"
                style={styles.input}
                value={form.mobile}
                onChangeText={(mobile) => setForm({ ...form, mobile })}
                onBlur={checkMobileAvailability}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                placeholder="At least 6 characters"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={form.password}
                onChangeText={(password) => setForm({ ...form, password })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Referral Code (Optional)</Text>
              <TextInput
                placeholder="Enter referral code if any"
                placeholderTextColor="#999"
                style={styles.input}
                value={form.referralCode}
                onChangeText={(referralCode) =>
                  setForm({ ...form, referralCode })
                }
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSignupProcess}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>SEND OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.otpContainer}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpTitle}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>
                  OTP sent to +91{form.mobile}
                </Text>
              </View>

              <TextInput
                placeholder="Enter 4-digit OTP"
                placeholderTextColor="#999"
                style={styles.otpInput}
                value={form.otp}
                onChangeText={(otp) => setForm({ ...form, otp })}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />

              <View style={styles.otpActions}>
                <TouchableOpacity 
                  onPress={resendOTP} 
                  disabled={timer > 0}
                  style={timer > 0 && styles.resendDisabled}
                >
                  <Text style={[styles.resendText, timer > 0 && styles.resendDisabledText]}>
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={styles.changeNumberText}>Change Number</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSignupProcess}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>VERIFY & SIGN UP</Text>
                )}
              </TouchableOpacity>
            </View>
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
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  hintText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  otpContainer: {
    marginTop: 20,
  },
  otpHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  otpTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
    padding: 18,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8,
    color: "#1a1a1a",
    marginBottom: 20,
  },
  otpActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  resendText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  resendDisabledText: {
    color: "#999",
  },
  resendDisabled: {
    opacity: 0.5,
  },
  changeNumberText: {
    color: "#666",
    fontSize: 14,
  },
});