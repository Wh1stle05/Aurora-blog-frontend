import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminUpload.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { useToast } from '../../context/useToast.js';
import { FaFileUpload, FaImage, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { apiUrl } from '../../utils/api.js';

export default function AdminUpload({ user }) {
  const [mdFile, setMdFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // 简单的管理员校验
  if (!user || user.email !== "admin@example.com") { // 这里可以根据实际管理员邮箱修改
    return (
      <PageWrapper>
        <Body>
          <PageContainer>
            <div className="glass blur" style={{ padding: '40px', textAlign: 'center' }}>
              <h2>您没有权限访问此页面</h2>
            </div>
          </PageContainer>
        </Body>
      </PageWrapper>
    );
  }

  const handleMdChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.md')) {
      setMdFile(file);
    } else {
      toast.error('请选择有效的 .md 文件');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...validImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mdFile) return toast.error('请先选择博文 (.md)');

    setLoading(true);
    const formData = new FormData();
    formData.append('md_file', mdFile);
    images.forEach(img => {
      formData.append('images', img);
    });

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(apiUrl('/api/admin/posts/upload-full'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '发布失败');

      toast.success('发布成功！');
      navigate(`/blog/${data.post_id}`);
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
          <div className={`glass blur ${styles.uploadCard}`}>
            <h1 className={styles.title}>博文发布中心</h1>
            <p className={styles.subtitle}>支持一键上传 Markdown 文档及其关联图片</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.dropzone}>
                <label className={styles.label}>
                  <FaFileUpload size={32} />
                  <span>{mdFile ? `已选择: ${mdFile.name}` : '点击上传博文 (.md)'}</span>
                  <input type="file" accept=".md" onChange={handleMdChange} hidden />
                </label>
              </div>

              <div className={styles.imageZone}>
                <div className={styles.imageHeader}>
                  <h3>图片附件 ({images.length})</h3>
                  <label className={styles.addImageBtn}>
                    <FaImage /> 添加图片
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden />
                  </label>
                </div>
                
                {images.length > 0 && (
                  <div className={styles.imageList}>
                    {images.map((img, idx) => (
                      <div key={idx} className={styles.imageItem}>
                        <span className={styles.fileName}>{img.name}</span>
                        <button type="button" onClick={() => removeImage(idx)} className={styles.removeBtn}>
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={`btn ${styles.publishBtn}`} 
                disabled={loading || !mdFile}
              >
                {loading ? '正在同步云端...' : (
                  <>
                    <FaPaperPlane /> 立即发布博文
                  </>
                )}
              </button>
            </form>
          </div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}
