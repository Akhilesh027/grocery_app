import { useEffect, useState } from "react";
import axios from "axios";
import "./ReferralManagement.css"; // Import CSS

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const res = await axios.get("https://api.sampurnamart.cloud/api/referrals");
      setReferrals(res.data.referrals || []);
      setLoading(false);
    } catch (err) {
      console.log("Fetch referral error:", err);
      setLoading(false);
    }
  };

  const updateCoins = async (id, newCoins) => {
    try {
      await axios.patch(`https://api.sampurnamart.cloud/api/referrals/${id}/update-coins`, {
        rewardCoins: newCoins,
      });
      alert("Coins updated successfully");
      fetchReferrals();
    } catch (err) {
      console.log("Coin update error:", err);
      alert("Error updating coins");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`https://api.sampurnamart.cloud/api/referrals/${id}/update-status`, {
        status,
      });
      alert("Status updated");
      fetchReferrals();
    } catch (err) {
      console.log("Update status error:", err);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <div className="referral-container">
      <h2 className="title">Referral Management</h2>

      {loading ? (
        <p className="loading">Loading referrals...</p>
      ) : referrals.length === 0 ? (
        <p className="no-data">No referral records found</p>
      ) : (
        <table className="referral-table">
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Referred User</th>
              <th>Code</th>
              <th>Status</th>
              <th>Coins</th>
              <th>Order</th>
              <th>Manage Coins</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {referrals.map((item) => (
              <tr key={item._id}>
                <td>
                  <b>{item.referrerId?.name}</b>
                  <br />
                  <small>{item.referrerId?.email}</small>
                </td>
                <td>
                  <b>{item.referredUserId?.name}</b>
                  <br />
                  <small>{item.referredUserId?.email}</small>
                </td>
                <td className="code">{item.referralCode}</td>
                <td>
                  <span
                    className={`badge ${
                      item.status === "completed"
                        ? "completed"
                        : item.status === "cancelled"
                        ? "cancelled"
                        : "pending"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{item.rewardCoins}</td>
                <td>{item.completedOrderId || "-"}</td>

                <td>
                  <input
                    type="number"
                    defaultValue={item.rewardCoins}
                    onBlur={(e) => updateCoins(item._id, e.target.value)}
                    className="coin-input"
                  />
                </td>

                <td>
                  <button
                    className="btn success"
                    onClick={() => updateStatus(item._id, "completed")}
                  >
                    Complete
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => updateStatus(item._id, "cancelled")}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReferralManagement;
