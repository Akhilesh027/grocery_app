// UPDATED CouponManager.jsx with backend + filter fix
import React, { useState, useEffect } from "react";

const API = "http://31.97.233.212:5000/api/coupons/available"; // update if needed

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minOrder: "",
    expiresAt: "",
    active: true,
  });
  const [editId, setEditId] = useState(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : data.coupons);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async () => {
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API}/${editId}` : API;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await res.json();
      setFormData({ code: "", description: "", type: "percentage", value: "", minOrder: "", expiresAt: "", active: true });
      setEditId(null);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoupon = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  const toggleCoupon = async (id) => {
    await fetch(`${API}/${id}/toggle`, { method: "PATCH" });
    fetchCoupons();
  };

  const filteredCoupons = Array.isArray(coupons)
    ? coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Coupon Manager</h2>

      <input
        placeholder="Search coupon"
        className="border px-3 py-2 rounded w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Code" className="border p-2" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
        <input placeholder="Description" className="border p-2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        <select className="border p-2" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>
        <input type="number" placeholder="Value" className="border p-2" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
        <input type="number" placeholder="Min Order" className="border p-2" value={formData.minOrder} onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })} />
        <input type="date" className="border p-2" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} />
      </div>

      <button className="bg-black text-white px-5 py-2 mt-3 rounded" onClick={handleSubmit}>{editId ? "Update" : "Add"} Coupon</button>

      <h3 className="text-xl font-semibold mt-6 mb-3">Coupons List</h3>

      {loading ? <p>Loading...</p> : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Code</th>
              <th className="p-2">Type</th>
              <th className="p-2">Value</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="p-2">{c.code}</td>
                <td className="p-2">{c.type}</td>
                <td className="p-2">{c.value}</td>
                <td className="p-2">{c.active ? "Yes" : "No"}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => { setEditId(c._id); setFormData(c); }}>Edit</button>
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => deleteCoupon(c._id)}>Delete</button>
                  <button className="px-2 py-1 bg-yellow-600 text-white rounded" onClick={() => toggleCoupon(c._id)}>
                    {c.active ? "Disable" : "Enable"}
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

export default CouponManager;