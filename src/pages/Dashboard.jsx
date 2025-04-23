import { useEffect, useState } from "react";
import { getLead } from "../api/leadApi";
import LeadBoard from "../components/LeadBoard";
import Confetti from "react-confetti";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard({ isLoggedIn, setIsLoggedIn }) {
  const [leadData, setLeadData] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getLead()
      .then((res) => setLeadData(res.data))
      .catch(() => {
        toast.error("Vui lòng đăng nhập lại");
        setTimeout(() => window.location.reload(), 2000);
      });
  }, []);

  const handleTriggerConfetti = () => {
    setConfettiKey(Date.now());
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  if (!leadData)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Đang tải dữ liệu...
        <ToastContainer />
      </div>
    );

  return (
    <div className="bg-black relative min-h-screen flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          key={confettiKey}
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={700}
          gravity={0.3}
          tweenDuration={10000}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
        />
      )}

      <LeadBoard
        data={leadData}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onTriggerConfetti={handleTriggerConfetti}
      />
      <ToastContainer />
    </div>
  );
}

export default Dashboard;
