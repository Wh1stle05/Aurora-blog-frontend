import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import styles from './Profile.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { useToast } from '../../context/useToast.js';
import Modal from '../../components/common/Modal/Modal.jsx';
import TurnstileWidget from '../../components/common/TurnstileWidget.jsx';
import { 
  uploadAvatar, 
  updateNickname, 
  updateEmail, 
  sendCode
} from '../../services/blogService';
import { 
  FaUser, FaEnvelope, FaCamera, FaShieldAlt
} from 'react-icons/fa';
import { resolveAssetUrl } from '../../utils/assets.js';
import { PUBLIC_TURNSTILE_SITE_KEY } from '../../../lib/env.js';
const TURNSTILE_SITE_KEY = PUBLIC_TURNSTILE_SITE_KEY;

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function Profile({ user, onUserUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailTurnstileToken, setEmailTurnstileToken] = useState("");

  // 头像裁剪
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef(null);
  
  const toast = useToast();

  const modalVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!user) {
    return (
      <PageWrapper>
        <Body><PageContainer><div className="glass blur" style={{padding: '100px', textAlign: 'center'}}>请先登录以管理个人资料</div></PageContainer></Body>
      </PageWrapper>
    );
  }

  // --- 头像相关 ---
  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      setCompletedCrop(null);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result.toString());
        setShowCropModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  // 从 canvas 获取 blob
  function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  async function handleAvatarSubmit() {
    if (!completedCrop || !imgRef.current) {
      toast.error("请先裁剪图像");
      return;
    }

    setLoading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, "avatar.jpg");
      // 构造 File 对象
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      
      const updatedUser = await uploadAvatar(file);
      onUserUpdate(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowCropModal(false);
      toast.success("头像已更新");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- 昵称相关 ---
  const handleNicknameSubmit = async () => {
    if (nicknameInput === user.nickname) {
      setShowNicknameModal(false);
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await updateNickname(nicknameInput);
      onUserUpdate(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowNicknameModal(false);
      toast.success("昵称修改成功");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 邮箱相关 ---
  const handleSendCode = async () => {
    if (!emailInput || !/^\S+@\S+\.\S+$/.test(emailInput)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }
    if (!emailTurnstileToken) {
      toast.error("请完成人机验证");
      return;
    }
    try {
      await sendCode(emailInput, emailTurnstileToken);
      setCountdown(60);
      toast.success("验证码已发送至新邮箱");
      setEmailTurnstileToken("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailInput || !codeInput) {
      toast.error("请填写完整信息");
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await updateEmail(emailInput, codeInput);
      onUserUpdate(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowEmailModal(false);
      setEmailInput('');
      setCodeInput('');
      toast.success("邮箱修改成功");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <div className={`glass blur ${styles.profileCard}`}>
            <div className={styles.header}>
              <div className={styles.avatarSection}>
                <div className={styles.mainAvatar}>
                  {user.avatar ? (
                    <img src={resolveAssetUrl(user.avatar)} alt="Avatar" />
                  ) : (
                    <FaUser size={40} />
                  )}
                  <label className={styles.cameraBtn} htmlFor="avatar-input">
                    <FaCamera />
                    <input id="avatar-input" type="file" accept="image/*" onChange={onSelectFile} hidden />
                  </label>
                </div>
                <div className={styles.userBrief}>
                  <h2>{user.nickname}</h2>
                  <p className="muted">注册时间：{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}><FaUser /> 昵称</div>
                  <div className={styles.infoValue}>
                    <span>{user.nickname}</span>
                    <button className={styles.editBtn} onClick={() => {
                      setNicknameInput(user.nickname);
                      setShowNicknameModal(true);
                    }}>修改</button>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}><FaEnvelope /> 绑定邮箱</div>
                  <div className={styles.infoValue}>
                    <span>{user.email}</span>
                    <button className={styles.editBtn} onClick={() => setShowEmailModal(true)}>更换</button>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}><FaShieldAlt /> 账号权限</div>
                  <div className={styles.infoValue}>
                    <span className="badge">普通用户</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Body>

      {/* 昵称修改 Modal */}
      <Modal
        open={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        contentClassName={`modal-content ${styles.modal}`}
        contentVariants={modalVariants}
      >
        <div className={styles.modalHeader}>
          <h3>修改昵称</h3>
          <button className="modal-close" onClick={() => setShowNicknameModal(false)}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.warningText}>提示：昵称每周只能修改一次，请谨慎操作。</p>
          <div className={styles.inputGroup}>
            <input 
              type="text" 
              value={nicknameInput} 
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="输入新昵称"
              maxLength={50}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn ghost" onClick={() => setShowNicknameModal(false)}>取消</button>
          <button className="btn" onClick={handleNicknameSubmit} disabled={loading}>
            {loading ? '提交中...' : '确认修改'}
          </button>
        </div>
      </Modal>

      {/* 邮箱修改 Modal */}
      <Modal
        open={showEmailModal}
        onClose={() => { setShowEmailModal(false); setEmailTurnstileToken(""); }}
        contentClassName={`modal-content ${styles.modal}`}
        contentVariants={modalVariants}
      >
        <div className={styles.modalHeader}>
          <h3>更换绑定邮箱</h3>
          <button className="modal-close" onClick={() => setShowEmailModal(false)}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.inputGroup}>
            <label>新邮箱地址</label>
            <input 
              type="email" 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="请输入新邮箱"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>验证码</label>
            <div className={styles.codeRow}>
              <input 
                type="text" 
                value={codeInput} 
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="6位验证码"
              />
              <button 
                className="btn ghost" 
                onClick={handleSendCode}
                disabled={countdown > 0 || !emailInput || !emailTurnstileToken}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>
          <TurnstileWidget
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={setEmailTurnstileToken}
            onExpire={() => {
              setEmailTurnstileToken("");
              toast.error("验证已过期，请重新验证");
            }}
            onError={() => {
              setEmailTurnstileToken("");
              toast.error("验证服务不可用，请稍后再试");
            }}
          />
        </div>
        <div className={styles.modalFooter}>
          <button className="btn ghost" onClick={() => setShowEmailModal(false)}>取消</button>
          <button className="btn" onClick={handleEmailSubmit} disabled={loading}>
            {loading ? '提交中...' : '确认更换'}
          </button>
        </div>
      </Modal>

      {/* 头像裁剪 Modal */}
      <Modal
        open={showCropModal}
        onClose={() => setShowCropModal(false)}
        contentClassName={`modal-content ${styles.cropModal}`}
        contentVariants={modalVariants}
        closeOnOverlay={false}
      >
        <h3>裁剪新头像</h3>
        <div className={styles.cropContainer}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img ref={imgRef} src={imgSrc} alt="Crop" onLoad={onImageLoad} style={{maxHeight: '50vh'}} />
          </ReactCrop>
        </div>
        <div className={styles.modalActions}>
          <button className="btn ghost" onClick={() => setShowCropModal(false)}>取消</button>
          <button className="btn" onClick={handleAvatarSubmit} disabled={loading}>
            {loading ? '上传中...' : '确认上传'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
