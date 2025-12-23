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
  const API_BASE_URL = "https://api.sampurnamart.cloud/api";

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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your account</Text>
        </View>

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
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#999"
                style={styles.input}
                value={form.email}
                onChangeText={(email) => setForm({ ...form, email })}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={form.password}
                onChangeText={(password) => setForm({ ...form, password })}
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Mobile Login Form
          <>
            {step === 1 ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={form.mobile}
                    onChangeText={(mobile) => setForm({ ...form, mobile })}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!loading}
                  />
                </View>
                <Text style={styles.mobileHint}>
                  We'll send an OTP to this number for verification
                </Text>
              </>
            ) : (
              <>
                <View style={styles.otpHeader}>
                  <Text style={styles.otpTitle}>Verify OTP</Text>
                  <Text style={styles.otpSubtitle}>
                    OTP sent to +91 {form.mobile}
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
                  editable={!loading}
                />

                <View style={styles.otpActions}>
                  <TouchableOpacity 
                    onPress={resendOTP} 
                    disabled={timer > 0 || loading}
                    style={timer > 0 && styles.resendDisabled}
                  >
                    <Text style={[
                      styles.resendText, 
                      (timer > 0 || loading) && styles.resendDisabledText
                    ]}>
                      {timer > 0
                        ? `Resend OTP in ${timer}s`
                        : "Resend OTP"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    disabled={loading}
                  >
                    <Text style={styles.changeNumberText}>
                      Change Number
                    </Text>
                  </TouchableOpacity>
                </View>
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

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity 
          style={[styles.socialButton, styles.facebookButton]} 
          disabled={loading}
        >
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]} 
          disabled={loading}
        >
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignupScreen")}
            disabled={loading}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  methodToggle: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#007AFF",
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  toggleText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "600",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  mobileHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: -8,
    marginBottom: 24,
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
  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  or: {
    paddingHorizontal: 16,
    color: "#666",
    fontSize: 14,
  },
  socialButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    borderColor: "#1877F2",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});