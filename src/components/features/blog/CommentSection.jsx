import React, { useState, useEffect, useCallback } from 'react';
import { getComments, createComment, reactComment, deleteComment } from '../../../services/blogService';
import styles from './CommentSection.module.css';
import { FaUser, FaReply, FaThumbsUp, FaThumbsDown, FaTrash } from 'react-icons/fa';
import TurnstileChallengeModal from '../../common/TurnstileChallengeModal.jsx';
import { useToast } from '../../../context/useToast.js';

const CommentItem = ({ comment, depth = 0, onReply, onReact, onDelete, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 一条评论，只要他的回复评论超过三条就全部折叠
  const shouldFoldChildren = comment.children && comment.children.length > 3;
  const hasChildren = comment.children && comment.children.length > 0;
  const childrenVisible = !shouldFoldChildren || isExpanded;
  
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
    setSubmitting(false);
    setIsExpanded(true); // expand to show new reply
  };

  const handleReactClick = (value) => {
    // Toggle logic: if user already has this reaction, clicking again removes it (value 0)
    const newValue = comment.user_reaction === value ? 0 : value;
    onReact(comment.id, newValue);
  };

  const isAuthor = currentUser && currentUser.id === comment.author.id;
  const isHidden = comment.is_visible === 0;
  const isDeleted = comment.is_visible === -1;
  const shouldDisableActions = isHidden || isDeleted;
  const shouldHideChildren = isDeleted;

  return (
    <div
      id={`comment-${comment.id}`}
      className={`${styles.commentItem} ${depth > 0 ? styles.replyItem : ''} ${isHidden ? styles.hiddenComment : isDeleted ? styles.deletedComment : ''}`}
    >
      <div className={styles.commentHeader}>
        <span className={styles.author}><FaUser size={12}/> {comment.author.nickname}</span>
        <span className={styles.date}>{new Date(comment.created_at).toLocaleString()}</span>
        {isHidden && <span className={styles.hiddenBadge}>该评论已被管理员隐藏</span>}
        {isDeleted && <span className={styles.deletedBadge}>该评论已被用户删除</span>}
      </div>
      <div className={styles.commentContent}>
        {isHidden ? "—— 该内容已被管理员隐藏 ——" : isDeleted ? "—— 该内容已被用户自行删除 ——" : comment.content}
      </div>
      
      <div className={styles.commentActions}>
        <button 
          type="button"
          disabled={shouldDisableActions}
          onClick={() => handleReactClick(1)} 
          className={`${styles.actionBtn} ${comment.user_reaction === 1 ? styles.actionBtnActiveLike : ''}`}
        >
          <FaThumbsUp size={14} /> <span>{comment.like_count || 0}</span>
        </button>
        <button 
          type="button"
          disabled={shouldDisableActions}
          onClick={() => handleReactClick(-1)} 
          className={`${styles.actionBtn} ${comment.user_reaction === -1 ? styles.actionBtnActiveDislike : ''}`}
        >
          <FaThumbsDown size={14} /> <span>{comment.dislike_count || 0}</span>
        </button>
        <button type="button" onClick={() => setShowReplyForm(!showReplyForm)} className={styles.actionBtn} disabled={shouldDisableActions}>
          <FaReply size={14} /> <span>回复</span>
        </button>
        {isAuthor && comment.is_visible === 1 && (
          <button type="button" onClick={() => onDelete(comment.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
            <FaTrash size={12} /> <span>删除</span>
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className={styles.replyForm}>
          <textarea 
            value={replyContent} 
            onChange={(e) => setReplyContent(e.target.value)} 
            placeholder={`回复 @${comment.author.nickname}...`}
            className={styles.replyInput}
            rows="2"
          />
          <div className={styles.replyFormActions}>
            <button type="button" onClick={() => setShowReplyForm(false)} className={styles.cancelBtn}>取消</button>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? '提交中...' : '回复'}
            </button>
          </div>
        </form>
      )}

      {hasChildren && shouldFoldChildren && !isExpanded && !shouldHideChildren && (
        <div className={styles.expandToggle}>
          <button type="button" onClick={() => setIsExpanded(true)} className={styles.expandBtn}>
            展开 {comment.children.length} 条回复
          </button>
        </div>
      )}

      {hasChildren && childrenVisible && !shouldHideChildren && (
        <div className={styles.childrenContainer}>
          {comment.children.map(child => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              depth={depth + 1} 
              onReply={onReply} 
              onReact={onReact} 
              onDelete={onDelete}
              currentUser={currentUser}
            />
          ))}
          {shouldFoldChildren && isExpanded && (
            <div className={styles.collapseToggle}>
              <button type="button" onClick={() => setIsExpanded(false)} className={styles.expandBtn}>
                收起回复
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingComment, setPendingComment] = useState(null);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useToast();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (err) {
      console.warn('Failed to read user from storage', err);
    }
  }, []);

  const loadComments = useCallback(() => {
    getComments(postId).then(data => {
      setComments(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (!comments.length) return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#comment-')) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add(styles.highlighted);
        setTimeout(() => el.classList.remove(styles.highlighted), 2000);
      }
    }
  }, [comments]);

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError('');
    setPendingComment({ parentId: null, content: content.trim() });
    setShowVerifyModal(true);
  };

  const handleReply = async (parentId, text) => {
    setPendingComment({ parentId, content: text.trim() });
    setShowVerifyModal(true);
  };

  const submitVerifiedComment = async (turnstileToken) => {
    if (!pendingComment?.content) return;
    setSubmitting(true);
    setError('');
    try {
      await createComment(postId, pendingComment.content, pendingComment.parentId, turnstileToken);
      if (pendingComment.parentId) {
        toast.success('回复发表成功');
      } else {
        setContent('');
        toast.success('评论发表成功');
      }
      setPendingComment(null);
      setShowVerifyModal(false);
      loadComments();
    } catch (err) {
      const message = err.message || (pendingComment.parentId ? '回复失败' : '发表评论失败');
      if (!pendingComment.parentId) {
        setError(message);
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReact = async (commentId, value) => {
    try {
      await reactComment(commentId, value);
      loadComments();
    } catch (err) {
      toast.error(err.message || '操作失败');
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("确定要删除您的这条评论吗？")) return;
    try {
      await deleteComment(commentId);
      loadComments();
      toast.success('评论已删除');
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className={`glass blur ${styles.commentSection}`}>
        <h3 className={styles.title}>评论区</h3>
        <div className={styles.commentsList}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <div className="skeleton" style={{ height: '20px', width: '100px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '120px', borderRadius: '4px' }}></div>
              </div>
              <div className="skeleton" style={{ height: '60px', width: '100%', borderRadius: '8px', marginTop: '10px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass blur ${styles.commentSection}`}>
      <h3 className={styles.title}>评论区</h3>
      
      <form onSubmit={handleMainSubmit} className={styles.mainForm}>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="写下你的评论..."
          className={styles.mainInput}
          rows="4"
        />
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formFooter}>
          <button type="submit" disabled={submitting} className={styles.submitMainBtn}>
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      </form>

      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <div className={styles.empty}>暂无评论，快来抢沙发吧！</div>
        ) : (
          comments.map(c => (
            <CommentItem 
              key={c.id} 
              comment={c} 
              depth={0} 
              onReply={handleReply} 
              onReact={handleReact} 
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
      <TurnstileChallengeModal
        open={showVerifyModal}
        onClose={() => !submitting && setShowVerifyModal(false)}
        onConfirm={submitVerifiedComment}
        loading={submitting}
        confirmLabel="确认发送"
      />
    </div>
  );
}
