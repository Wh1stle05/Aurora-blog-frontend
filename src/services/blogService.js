// 博客API服务
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 基础 fetch 封装，自动携带凭证
const apiFetch = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  // 统一拦截 401 未授权错误
  if (response.status === 401) {
    // 这里我们可以发送一个自定义事件，或者通过 AuthContext 处理
    // 简单起见，清除本地存储并让页面感知
    localStorage.removeItem('user');
    if (!url.includes('/auth/me')) {
       // 如果不是在 checkAuth 时报错，可以考虑提示用户
       console.warn("Session expired or unauthorized");
    }
  }
  
  return response;
};

// 获取博客列表 (支持分页、搜索、筛选、排序)
export const getPosts = async (page = 1, pageSize = 5, search = '', tag = '', sortBy = 'created_at') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (sortBy) params.append('sort_by', sortBy);

    const response = await apiFetch(`${API_BASE_URL}/posts/paginated?${params}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || '获取文章列表失败');
    }
  } catch (error) {
    console.error('获取文章列表错误:', error);
    throw error;
  }
};

// 获取文章详情
export const getPost = async (id, skipView = false) => {
  try {
    const url = new URL(`${API_BASE_URL}/posts/${id}`, window.location.origin);
    if (skipView) {
      url.searchParams.append('skip_view', 'true');
    }
    const response = await apiFetch(url.toString());
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '获取文章详情失败');
    return data;
  } catch (error) {
    console.error('获取文章详情错误:', error);
    throw error;
  }
};

// 获取评论列表
export const getComments = async (postId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/posts/${postId}/comments`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取评论错误:', error);
    throw error;
  }
};

// 发表评论
export const createComment = async (postId, content, parentId = null) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId })
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) throw new Error('请先登录');
      throw new Error(data.detail || '发表评论失败');
    }

    return data;
  } catch (error) {
    console.error('发表评论错误:', error);
    throw error;
  }
};

// 删除评论 (用户软删除)
export const deleteComment = async (commentId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/posts/comments/${commentId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '删除失败');
    return data;
  } catch (error) {
    console.error('删除评论错误:', error);
    throw error;
  }
};

// 点赞/点踩
export const reactPost = async (postId, value) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ 
        target_type: 'post',
        target_id: parseInt(postId),
        value: value 
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) throw new Error('请先登录');
      throw new Error(data.detail || '操作失败');
    }
    
    return data;
  } catch (error) {
    console.error('点赞错误:', error);
    throw error;
  }
};

// 评论点赞/点踩
export const reactComment = async (commentId, value) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ 
        target_type: 'comment',
        target_id: parseInt(commentId),
        value: value 
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) throw new Error('请先登录');
      throw new Error(data.detail || '操作失败');
    }
    
    return data;
  } catch (error) {
    console.error('评论点赞错误:', error);
    throw error;
  }
};

// 获取站点统计信息
export const getStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取统计信息错误:', error);
    throw error;
  }
};

// 获取 About 内容
export const getAbout = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/about`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取关于页失败:', error);
    throw error;
  }
};

// 获取可用标签列表
export const getTags = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/tags`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    throw error;
  }
};

// 上传头像
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '上传失败');
    return data;
  } catch (error) {
    console.error('头像上传错误:', error);
    throw error;
  }
};

// 发送验证码
export const sendCode = async (email) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/send-code`, {
      method: "POST",
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '发送验证码失败');
    return data;
  } catch (error) {
    console.error('发送验证码错误:', error);
    throw error;
  }
};

// 更新昵称
export const updateNickname = async (nickname) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/nickname`, {
      method: "PUT",
      body: JSON.stringify({ nickname })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '更新昵称失败');
    return data;
  } catch (error) {
    console.error('更新昵称错误:', error);
    throw error;
  }
};

// 更新邮箱
export const updateEmail = async (email, code) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/email`, {
      method: "PUT",
      body: JSON.stringify({ email, code })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '更新邮箱失败');
    return data;
  } catch (error) {
    console.error('更新邮箱错误:', error);
    throw error;
  }
};

// 获取历史记录
export const getNicknameHistory = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/history/nickname`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '获取昵称历史失败');
    return data;
  } catch (error) {
    console.error('获取昵称历史错误:', error);
    throw error;
  }
};

export const getEmailHistory = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/history/email`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || '获取邮箱历史失败');
    return data;
  } catch (error) {
    console.error('获取邮箱历史错误:', error);
    throw error;
  }
};
