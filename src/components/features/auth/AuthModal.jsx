import React, { useState, useEffect } from "react";
import { FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../context/useToast.js";
import Modal from "../../common/Modal/Modal.jsx";
import TurnstileWidget from "../../common/TurnstileWidget.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nickname: "", email: "", password: "", code: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loginTurnstileToken, setLoginTurnstileToken] = useState("");
  const toast = useToast();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(pwd);
  };

  const sendCode = async () => {
    if (!form.email) {
      toast.error("请先输入邮箱");
      return;
    }
    if (!turnstileToken) {
      toast.error("请完成人机验证");
      return;
    }
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, turnstile_token: turnstileToken })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '发送失败');
      
      setCountdown(60);
      toast.success("验证码已发送");
      setTurnstileToken("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (mode === "register") {
      if (!validatePassword(form.password)) {
        toast.error("密码必须包含字母和数字，且不少于6位");
        return;
      }
      if (!form.code) {
        toast.error("请输入验证码");
        return;
      }
    } else {
      if (!loginTurnstileToken) {
        toast.error("请完成人机验证");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.detail || '注册失败');
        toast.success("注册成功");
      }

      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          turnstile_token: loginTurnstileToken,
        })
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.detail || '登录失败');

      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      
      if (onAuth) onAuth(loginData);
      toast.success("登录成功");
      setLoginTurnstileToken("");
      setTimeout(onClose, 800);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 }
  };

  const formVariants = {
    initial: { x: 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -10, opacity: 0 },
    transition: { duration: 0.2 }
  };

  return (
    <Modal
      open
      onClose={onClose}
      contentClassName="modal-content"
      contentStyle={{ borderRadius: 'var(--radius)' }}
      contentVariants={modalVariants}
    >
      <button className="modal-close" onClick={onClose}><FaXmark size={24} /></button>

      <div className="auth-switch">
        <button 
          className={mode === "login" ? "active" : ""} 
          onClick={() => { setMode("login"); setStatus(null); setTurnstileToken(""); setLoginTurnstileToken(""); }}
        >
          登录
        </button>
        <button 
          className={mode === "register" ? "active" : ""} 
          onClick={() => { setMode("register"); setStatus(null); setTurnstileToken(""); setLoginTurnstileToken(""); }}
        >
          注册
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "login" ? (
          <motion.form
            key="login"
            className="form"
            onSubmit={submit}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <label>
              邮箱
              <input type="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              密码
              <input type="password" placeholder="字母+数字，6位以上" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <TurnstileWidget
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setLoginTurnstileToken}
              onExpire={() => {
                setLoginTurnstileToken("");
                toast.error("验证已过期，请重新验证");
              }}
              onError={() => {
                setLoginTurnstileToken("");
                toast.error("验证服务不可用，请稍后再试");
              }}
            />
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn" type="submit" disabled={loading}>
              {loading ? "正在同步..." : "登录"}
            </motion.button>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              初次见面？ <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setMode("register")}>注册新账号</span>
            </div>
            {status && !status.startsWith("success") && <p className="status">{status}</p>}
          </motion.form>
        ) : (
          <motion.form
            key="register"
            className="form"
            onSubmit={submit}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <label>
              昵称
              <input placeholder="设置您的公开昵称" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required />
            </label>
            <label>
              邮箱
              <input type="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              验证码
              <div className="v-code-group">
                <input style={{ flex: 1 }} placeholder="6位验证码" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                <button type="button" className="v-code-btn" disabled={countdown > 0 || !form.email || !turnstileToken} onClick={sendCode}>
                  {countdown > 0 ? `${countdown}s 后重试` : "获取验证码"}
                </button>
              </div>
            </label>
            <TurnstileWidget
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setTurnstileToken}
              onExpire={() => {
                setTurnstileToken("");
                toast.error("验证已过期，请重新验证");
              }}
              onError={() => {
                setTurnstileToken("");
                toast.error("验证服务不可用，请稍后再试");
              }}
            />
            <label>
              密码
              <input type="password" placeholder="字母+数字，6位以上" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn" type="submit" disabled={loading}>
              {loading ? "正在同步..." : "创建账号"}
            </motion.button>
            {status === "success-code" && <p style={{ color: '#4facfe', fontSize: '0.85rem', textAlign: 'center' }}>验证码已发送至您的邮箱</p>}
            {status && !status.startsWith("success") && <p className="status">{status}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
