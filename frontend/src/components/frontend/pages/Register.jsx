import { useState } from "react";
import { register } from "../../../api/auth";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Lỗi đăng ký: " + (err.response?.data?.message || "Server error"));
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Tên" onChange={e => setForm({...form, name: e.target.value})}/>
        <input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})}/>
        <input type="password" placeholder="Mật khẩu" onChange={e => setForm({...form, password: e.target.value})}/>
        <button type="submit">Đăng ký</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;
