import Modal from "./Modal/Modal.jsx";
import TurnstileWidget from "./TurnstileWidget.jsx";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export default function TurnstileChallengeModal({
  open,
  title = "请完成人机验证",
  description = "验证通过后会继续提交。",
  onClose,
  onVerify,
  onError,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      contentClassName="modal-content"
    >
      <button className="modal-close" onClick={onClose} type="button" aria-label="关闭">&times;</button>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{description}</p>
        </div>
        <TurnstileWidget
          siteKey={TURNSTILE_SITE_KEY}
          onVerify={onVerify}
          onExpire={() => onError?.("人机验证已过期，请重新验证") }
          onError={() => onError?.("人机验证不可用") }
        />
      </div>
    </Modal>
  );
}
