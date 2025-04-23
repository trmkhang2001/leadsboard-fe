import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import { refresh } from "./api/authApi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    refresh()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null)
    return (
      <div className="flex items-center justify-center min-h-screen  text-white">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );

  return (
    <div className=" min-h-screen text-white">
      {/* {isLoggedIn ? (
        <Dashboard />
      ) : (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      )} */}
      <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="dark"
        hideProgressBar={false}
        newestOnTop={true}
        pauseOnFocusLoss
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default App;
