import { useState, useEffect } from "react";
import {
  Flag,
  BarChart3,
  RotateCcw,
  RotateCw,
  Plus,
  Trophy,
} from "lucide-react";
import {
  addLead,
  updateTarget,
  undoLead,
  redoLead,
  getLead,
  resetLead,
} from "../api/leadApi";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { login } from "../api/authApi";

function LeadBoard({ data: initialData, isLoggedIn, setIsLoggedIn }) {
  const [leadInput, setLeadInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const numberFormat = new Intl.NumberFormat("vi-VN");
  const handleInputChange = (e) => setLeadInput(e.target.value);
  const handleTargetChange = (e) => setTargetInput(e.target.value);

  const refreshData = async () => {
    const res = await getLead();
    setData(res.data);
  };

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 40, spread: 70, ticks: 60, zIndex: 999 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.3, y: 0.5 },
        angle: 120,
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.7, y: 0.5 },
        angle: 30,
      });
    }, 200);
  };

  const requireLogin = (action) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const handleLeadSubmit = async () => {
    const value = parseInt(leadInput);
    if (!value || isNaN(value)) {
      toast.warn("Vui lòng nhập số hợp lệ");
      return;
    }
    try {
      setLoading(true);
      await addLead(value);
      const updated = await getLead();
      setData(updated.data);
      setLeadInput("");
      triggerConfetti();
      if (updated.data.achievedLeads >= updated.data.totalTarget) {
        toast.success("Bạn đã hoàn thành mục tiêu!");
      } else {
        toast.success("Đã cập nhật số lead tuần này");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể thêm lead");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    try {
      await undoLead();
      await refreshData();
      toast.success("Hoàn tác thành công");
    } catch {
      toast.error("Không thể hoàn tác");
    }
  };

  const handleRedo = async () => {
    try {
      await redoLead();
      await refreshData();
      toast.success("Làm lại thành công");
    } catch {
      toast.error("Không thể redo");
    }
  };

  const handleTargetUpdate = async () => {
    const newTarget = parseInt(targetInput);
    if (!newTarget || isNaN(newTarget)) {
      toast.warn("Vui lòng nhập một số hợp lệ");
      return;
    }
    try {
      await updateTarget(newTarget);
      await refreshData();
      setTargetInput("");
      toast.success("Mục tiêu đã được cập nhật");
    } catch {
      toast.error("Cập nhật mục tiêu thất bại");
    }
  };

  const confirmResetToast = (onConfirm) => {
    const toastId = toast.info(
      ({ closeToast }) => (
        <div className="text-sm">
          <p className="mb-2">Bạn có chắc chắn muốn reset hệ thống?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                await onConfirm();
                toast.dismiss(toastId);
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Xác nhận
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  };

  const handleReset = () => {
    confirmResetToast(async () => {
      await resetLead();
      await refreshData();
      toast.success("Hệ thống đã được reset");
    });
  };

  const remainingLeads = data.totalTarget - data.achievedLeads;
  const exceededLeads = data.achievedLeads - data.totalTarget;
  const progressPercent =
    data.totalTarget > 0
      ? Math.min((data.achievedLeads / data.totalTarget) * 100, 100)
      : 0;

  if (data.totalTarget === 0) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
          <div className="flex items-center mb-4">
            <Flag className="text-white mr-2" size={20} />
            <h2 className="text-xl text-white font-bold">Đặt Mục Tiêu Tổng</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Bạn chưa có mục tiêu tổng. Vui lòng đặt mục tiêu để bắt đầu theo
            dõi.
          </p>
          <input
            type="number"
            value={targetInput}
            onChange={handleTargetChange}
            placeholder="Nhập mục tiêu tổng"
            className="w-full bg-gray-700 text-white rounded p-2 mb-3"
          />
          <button
            onClick={() => requireLogin(handleTargetUpdate)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center"
          >
            <Plus size={18} className="mr-1" />
            <span>Đặt Mục Tiêu Tổng</span>
          </button>
        </div>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md w-full relative">
      <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Flag className="text-white mr-2" size={20} />
            <h2 className="text-xl text-white font-bold">Bảng Mục Tiêu ABM</h2>
          </div>
          <button
            onClick={() => requireLogin(handleReset)}
            className="text-black bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm p-2 text-center"
          >
            RESET
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Nhập số leads hàng tuần và theo dõi tiến trình của bạn!
        </p>
        <div className="mb-6">
          <input
            type="text"
            value={leadInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") requireLogin(handleLeadSubmit);
            }}
            placeholder="Nhập số lead tuần này"
            className="w-full bg-[#2c2c2c] text-white rounded p-2 mb-3"
            disabled={loading}
          />
          <button
            onClick={() => requireLogin(handleLeadSubmit)}
            className="w-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br text-white py-2 rounded flex items-center justify-center"
          >
            <Plus size={18} className="mr-1" />
            <span>Cập Nhật Mục Tiêu Tuần</span>
          </button>
        </div>
        <div className="flex justify-between mb-6">
          <button
            onClick={() => requireLogin(handleUndo)}
            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center"
            disabled={data.historyStack.length === 0}
          >
            <RotateCcw size={18} className="mr-1" />
            <span>Undo</span>
          </button>
          <button
            onClick={() => requireLogin(handleRedo)}
            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center"
            disabled={data.redoStack.length === 0}
          >
            <RotateCw size={18} className="mr-1" />
            <span>Redo</span>
          </button>
        </div>

        <div className="mb-2">
          <div className="flex items-center mb-1">
            <BarChart3 className="text-white mr-2" size={16} />
            <span className="text-white font-bold">
              Mục Tiêu Tổng: {numberFormat.format(data.totalTarget)} Leads
            </span>
          </div>
          {/* <div className="text-red-500 flex items-center mb-1 font-bold">
            <Trophy className="text-red-500 mr-1" size={16} />
            Số leads còn lại: {remainingLeads}
          </div> */}
          <div className="flex flex-col gap-1 mb-1">
            <div className="text-red-500 flex items-center font-bold">
              <Trophy className="text-red-500 mr-1" size={16} />
              Số leads còn lại:{" "}
              {numberFormat.format(Math.max(remainingLeads, 0))}
            </div>

            {exceededLeads > 0 && (
              <div className="text-green-400 flex items-center font-bold">
                <Trophy className="text-green-400 mr-1" size={16} />
                Đã vượt chỉ tiêu: {numberFormat.format(exceededLeads)}
              </div>
            )}
          </div>
          <div className="text-green-500 flex items-center mb-3 font-bold">
            <Trophy className="text-green-500 mr-1" size={16} />
            Số leads đã đạt được: {numberFormat.format(data.achievedLeads)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-6 mb-4 relative overflow-hidden">
            <div
              className="bg-green-600 h-6 rounded-full absolute top-0 left-0"
              style={{ width: `${progressPercent}%` }}
            ></div>
            <div className="absolute w-full text-center text-sm text-white z-10">
              {progressPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center mb-3">
          <BarChart3 className="text-white mr-2" size={16} />
          <span className="text-white font-bold">Lịch Sử Cập Nhật</span>
        </div>
        <p className="text-gray-400 text-sm mb-4">Lịch sử nộp leads</p>
        <div className="bg-gray-800 rounded p-3 h-48 overflow-y-auto custom-scroll">
          {data.inputHistory.length > 0 ? (
            data.inputHistory.map((entry, index) => (
              <div
                key={index}
                className="text-white text-sm mb-2 bg-gray-500 p-2 rounded"
              >
                {entry.timestamp}: Thêm {numberFormat.format(entry.value)} leads
                (Tổng: {numberFormat.format(entry.total)} leads)
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center pt-16">
              Chưa có dữ liệu nào.
            </div>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
    </div>
  );
}

function LoginModal({ onClose, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warn("Vui lòng nhập email và mật khẩu");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      setIsLoggedIn(true);
      toast.success("Đăng nhập thành công");
      onClose();
    } catch (err) {
      toast.error("Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
          Đăng nhập để chỉnh sửa
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-medium mb-2"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <button
          onClick={onClose}
          className="w-full text-gray-600 text-sm hover:underline text-center"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

export default LeadBoard;
