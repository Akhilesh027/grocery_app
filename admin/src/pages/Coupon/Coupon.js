import React, { useState, useEffect } from "react";

const READ_API = "https://api.sampurnamart.cloud/api/coupons/available";
const BASE_API = "https://api.sampurnamart.cloud/api/coupons";

const initialForm = {
  code: "",
  description: "",
  type: "percentage",
  value: "",
  minOrder: "",
  expiresAt: "",
  active: true,
};

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  // 🔄 Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(READ_API);
      const data = await res.json();
      setCoupons(data.coupons || data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ➕➖ Add / Update coupon
  const handleSubmit = async () => {
    try {
      const url = editId ? `${BASE_API}/${editId}` : BASE_API;
      const method = editId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
        }),
      });

      setFormData(initialForm);
      setEditId(null);
      fetchCoupons();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // ❌ Delete coupon
  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await fetch(`${BASE_API}/${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  // 🔁 Toggle coupon
  const toggleCoupon = async (id) => {
    await fetch(`${BASE_API}/${id}/toggle`, { method: "PATCH" });
    fetchCoupons();
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🎟 Coupon Management</h2>

      {/* 🔍 Search */}
      <input
        placeholder="Search coupon code..."
        className="border rounded-lg px-4 py-2 w-full mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ➕ Add / Edit */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editId ? "✏️ Edit Coupon" : "➕ Add Coupon"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Coupon Code"
            className="border p-3 rounded"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
          />

          <input
            placeholder="Description"
            className="border p-3 rounded"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <select
            className="border p-3 rounded"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>

          <input
            type="number"
            placeholder="Discount Value"
            className="border p-3 rounded"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Minimum Order"
            className="border p-3 rounded"
            value={formData.minOrder}
            onChange={(e) =>
              setFormData({ ...formData, minOrder: e.target.value })
            }
          />

          <input
            type="date"
            className="border p-3 rounded"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {editId ? "Update Coupon" : "Add Coupon"}
        </button>
      </div>

      {/* 📋 Coupon List */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">📋 Coupons</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-3 font-semibold">{c.code}</td>
                  <td className="p-3 capitalize">{c.type}</td>
                  <td className="p-3">
                    {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setEditId(c._id);
                        setFormData({
                          code: c.code,
                          description: c.description || "",
                          type: c.type,
                          value: c.value,
                          minOrder: c.minOrder || "",
                          expiresAt: c.expiresAt
                            ? c.expiresAt.split("T")[0]
                            : "",
                          active: c.active,
                        });
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => deleteCoupon(c._id)}
                    >
                      Delete
                    </button>

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => toggleCoupon(c._id)}
                    >
                      {c.active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CouponManager;
