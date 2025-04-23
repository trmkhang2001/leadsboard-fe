import { useState } from "react";
import { login } from "../api/authApi";

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      onLoginSuccess(); // gọi callback để chuyển trang
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>
        <input
          className="w-full p-2 rounded bg-gray-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 rounded bg-gray-700"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-green-500 hover:bg-green-600 p-2 rounded"
          onClick={handleLogin}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
