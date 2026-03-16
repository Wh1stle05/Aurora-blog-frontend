import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const defaultOverlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const defaultContentVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 }
};

export default function Modal({
  open,
  onClose,
  children,
  overlayClassName = "",
  contentClassName = "",
  overlayStyle,
  contentStyle,
  overlayVariants = defaultOverlayVariants,
  contentVariants = defaultContentVariants,
  closeOnOverlay = true
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`modal-overlay ${overlayClassName}`}
          style={overlayStyle}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={closeOnOverlay ? onClose : undefined}
        >
          <motion.div
            className={contentClassName}
            style={contentStyle}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
