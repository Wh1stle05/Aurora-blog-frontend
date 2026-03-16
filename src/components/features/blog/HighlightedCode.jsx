import React, { useEffect, useRef } from 'react';

/**
 * 自高亮的代码组件
 * 解决 React 重渲染导致 Prism 高亮丢失的问题
 */
const HighlightedCode = ({ code, language, ...props }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && window.Prism) {
      // 触发 Prism 针对该 DOM 元素的染色
      window.Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <code 
      ref={codeRef} 
      className={`language-${language}`} 
      {...props}
    >
      {code}
    </code>
  );
};

export default HighlightedCode;
