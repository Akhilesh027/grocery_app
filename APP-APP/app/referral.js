import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReferralScreen() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, pending: 0, totalEarned: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not found. Please login again.");
          return;
        }

        const res = await fetch(`https://api.sampurnamart.cloud/api/referrals/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch referral data.");
        }

        setReferrals(data.referrals || []);
        setStats({
          completed: data.completed || 0,
          pending: data.pending || 0,
          totalEarned: data.totalEarned || 0,
        });
        setUser(data.user);
      } catch (error) {
        console.error("Referral fetch error:", error);
        Alert.alert("Error", error.message || "Failed to load referral data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleShare = async () => {
    if (!user?.referralCode) return;
    try {
      await Share.share({
        message: `🎁 Join this awesome app and earn rewards!\nUse my referral code: ${user.referralCode}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading your referrals...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Referral Program</Text>

      {/* Referral Code Card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{user?.referralCode}</Text>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>Share Code</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalEarned} Coins</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
      </View>

      {/* Referral List */}
      <Text style={styles.subTitle}>Your Referrals</Text>
      {referrals.length === 0 ? (
        <Text style={styles.noReferrals}>No referrals yet 😔</Text>
      ) : (
        <FlatList
          data={referrals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.referralCard}>
              <View>
                <Text style={styles.referralName}>
                  👤 {item.referredUserId?.name || "Unknown User"}
                </Text>
                <Text style={styles.referralEmail}>
                  📧 {item.referredUserId?.email || "No Email"}
                </Text>
                <Text style={styles.referralDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.referralStatus,
                    {
                      color: item.status === "completed" ? "#00A86B" : "#FFA500",
                      backgroundColor:
                        item.status === "completed" ? "#E8FFF3" : "#FFF7E5",
                    },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
                <Text style={styles.rewardText}>+{item.rewardCoins} coins</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#00A86B", textAlign: "center" },
  codeCard: {
    backgroundColor: "#E8FFF3",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  codeLabel: { fontSize: 16, color: "#333" },
  code: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00A86B",
    marginVertical: 10,
    letterSpacing: 2,
  },
  shareBtn: {
    backgroundColor: "#00A86B",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  shareText: { color: "#fff", fontWeight: "bold" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#333" },
  statLabel: { color: "#777", marginTop: 5 },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  noReferrals: { textAlign: "center", color: "#777", marginTop: 10 },
  referralCard: {
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#00A86B",
  },
  referralName: { fontSize: 16, fontWeight: "600", color: "#333" },
  referralEmail: { fontSize: 13, color: "#666", marginTop: 2 },
  referralDate: { color: "#888", fontSize: 12, marginTop: 3 },
  referralStatus: {
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    fontSize: 13,
  },
  rewardText: { color: "#333", fontSize: 13, marginTop: 3, fontWeight: "600" },
});
