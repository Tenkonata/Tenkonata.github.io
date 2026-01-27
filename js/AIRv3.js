// 声明全局 pjax 变量
var pjax;
// 标记变量：用于判断是否点击了分页器
var isPaginationClick = false;

// 1. 定义初始化函数 (处理每次页面切换后需要运行的逻辑)
function initAIRTheme() {
  
  // --- 背景模糊控制 ---
  var fixedBg = document.querySelector('.fixed-bg');
  var isPostPage = document.querySelector('.post-page-card'); 
  // 检测是否为 Timeline 页面 (Tags / Categories)
  var isTimelinePage = document.querySelector('.timeline-section');
  
  if (fixedBg) {
    // 如果是文章详情页 或者 Tags/Categories 时间线页，应用背景模糊
    if (isPostPage || isTimelinePage) {
      requestAnimationFrame(() => fixedBg.classList.add('blur-mode'));
    } else {
      fixedBg.classList.remove('blur-mode');
    }
  }

  // --- 向下滚动按钮 (位于 Pjax 容器内，需每次重新绑定) ---
  var scrollBtn = document.getElementById('scroll-down-btn');
  var mainContent = document.querySelector('.post-list-section'); 

  if (scrollBtn && mainContent) {
    // 使用 cloneNode 防止重复绑定
    var newScrollBtn = scrollBtn.cloneNode(true);
    if(scrollBtn.parentNode) {
      scrollBtn.parentNode.replaceChild(newScrollBtn, scrollBtn);
    }
    newScrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  
  // --- 导航栏当前页回顶处理 ---
  var navLinks = document.querySelectorAll('.theme-title, .nav-link, .sidebar-link');
  navLinks.forEach(function(link) {
    link.onclick = function(e) {
      if (link.pathname === window.location.pathname) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
  });

  // --- 初始化侧边栏折叠功能 (Tags & Categories) ---
  // CSS Hover 模式下无需 JS 逻辑，保留函数调用防止报错
  // initSidebarExpand(); 

  // --- 初始化归档页搜索功能 ---
  if (typeof initArchiveSearch === 'function') {
    initArchiveSearch();
  } else if (document.getElementById('archive-search')) {
      initArchiveSearch();
  }

  // --- TOC 链接平滑滚动逻辑 ---
  if (typeof initTocSmoothScroll === 'function') {
    initTocSmoothScroll();
  } else {
      initTocSmoothScroll();
  }

  // --- [顺序调整] Highlight.js 初始化 (先高亮) ---
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el);
    });
  }

  // --- [新增] 代码块增强 (复制按钮 + 语言标识) (后添加按钮) ---
  initCodeBlocks();
}

// [新增] 代码块增强功能初始化
function initCodeBlocks() {
  // 选择所有文章内容下的 pre 标签
  var preTags = document.querySelectorAll('.post-content pre');
  
  preTags.forEach(function(pre) {
    // 1. 避免重复添加
    if (pre.querySelector('.copy-btn')) return;

    // 2. 获取代码容器 code
    var code = pre.querySelector('code');
    if (!code) return; // 如果 pre 里没有 code，跳过

    // 3. 智能获取语言类型
    var langName = 'TEXT';
    // Highlight.js 处理后，类名通常在 code 上
    var classes = code.className.split(/\s+/);
    
    classes.forEach(function(cls) {
      if (cls === 'hljs') return; // 忽略基础类
      if (cls.startsWith('language-')) {
        langName = cls.replace('language-', '').toUpperCase();
      } else if (cls.startsWith('lang-')) {
        langName = cls.replace('lang-', '').toUpperCase();
      } else if (cls.length > 0 && langName === 'TEXT') {
        // 如果没有 standard 前缀，尝试取第一个非空类名
        langName = cls.toUpperCase();
      }
    });
    
    // 如果 code 上没找到，尝试从 pre 上找 (Hexo 默认有时会加在 pre 上)
    if (langName === 'TEXT') {
        var preClasses = pre.className.split(/\s+/);
        preClasses.forEach(function(cls) {
             if (cls.startsWith('language-') || cls.startsWith('lang-')) {
                langName = cls.replace(/^language-|^lang-/, '').toUpperCase();
             }
        });
    }

    // 4. 创建语言标签
    var langTag = document.createElement('span');
    langTag.className = 'code-lang-tag';
    langTag.innerText = langName;
    pre.appendChild(langTag);

    // 5. 创建复制按钮
    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
    copyBtn.setAttribute('aria-label', 'Copy Code');
    
    // 6. 绑定点击复制事件
    copyBtn.addEventListener('click', function() {
      // 获取纯文本 (innerText 会忽略 HTML 标签)
      var codeText = code.innerText; 
      
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(codeText).then(function() {
              showCopiedState(copyBtn);
          }).catch(function(err) {
              console.error('Copy failed:', err);
              fallbackCopyTextToClipboard(codeText, copyBtn);
          });
      } else {
          // 降级方案
          fallbackCopyTextToClipboard(codeText, copyBtn);
      }
    });

    pre.appendChild(copyBtn);
  });
}

// [新增] 复制成功视觉反馈
function showCopiedState(btn) {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fa fa-check"></i>'; // 变成对勾
    
    setTimeout(function() {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fa fa-copy"></i>'; // 变回图标
    }, 2000);
}

// [新增] 兼容旧浏览器的复制方案
function fallbackCopyTextToClipboard(text, btn) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // 确保文本域不可见但可选中
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    if (successful) {
        showCopiedState(btn);
    }
  } catch (err) {
    console.error('Fallback copy failed', err);
  }

  document.body.removeChild(textArea);
}

// TOC 平滑滚动处理函数
function initTocSmoothScroll() {
  var tocLinks = document.querySelectorAll('.toc-link');
  
  tocLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault(); 
      
      try {
          var targetId = decodeURIComponent(this.getAttribute('href').substring(1)); 
          var targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            var offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80;
            
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
            
            if (history.pushState) {
              history.pushState(null, null, '#' + targetId);
            }
          }
      } catch (err) {
          console.error("TOC scroll error:", err);
      }
    });
  });
}

// 归档页搜索逻辑封装
function initArchiveSearch() {
  const activeInput = document.getElementById('archive-search');
  if (!activeInput) return;

  if (activeInput.dataset.init === 'true') return;
  activeInput.dataset.init = 'true';

  const cardWrappers = document.querySelectorAll('.archive-card-wrapper');
  const noResult = document.getElementById('no-result');
  let isComposing = false;

  function doSearch() {
      const query = activeInput.value.trim().toLowerCase();
      let matchCount = 0;

      cardWrappers.forEach(wrapper => {
          const searchText = wrapper.getAttribute('data-search-text') || '';
          
          if (searchText.includes(query)) {
              wrapper.classList.remove('hidden');
              matchCount++;
          } else {
              wrapper.classList.add('hidden');
          }
      });

      if (noResult) {
          if (matchCount === 0) {
              noResult.classList.add('show');
              noResult.style.display = 'block'; 
          } else {
              noResult.classList.remove('show');
              noResult.style.display = 'none';
          }
      }
  }

  activeInput.addEventListener('compositionstart', function() { isComposing = true; });
  activeInput.addEventListener('compositionend', function() { isComposing = false; doSearch(); });
  activeInput.addEventListener('input', function() {
      if (isComposing) return;
      doSearch();
  });
}

// 2. 回到顶部按钮逻辑
var backToTopBtn = document.getElementById('back-to-top');
var bttText = backToTopBtn ? backToTopBtn.querySelector('.btt-text') : null;

function handleScroll() {
  if (!backToTopBtn || !backToTopBtn.isConnected) {
    backToTopBtn = document.getElementById('back-to-top');
    bttText = backToTopBtn ? backToTopBtn.querySelector('.btt-text') : null;
    if (!backToTopBtn) return;
  }

  var scrollTop = window.scrollY || document.documentElement.scrollTop;
  var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrollPercent = 0;
  
  if (docHeight > 0) {
    scrollPercent = Math.round((scrollTop / docHeight) * 100);
  }

  if (bttText) {
    bttText.innerText = scrollPercent + '%';
  }

  if (scrollTop > 300) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
}

function initBackToTop() {
  backToTopBtn = document.getElementById('back-to-top');
  
  if (backToTopBtn) {
    var newBtt = backToTopBtn.cloneNode(true);
    if (backToTopBtn.parentNode) {
        backToTopBtn.parentNode.replaceChild(newBtt, backToTopBtn);
    }
    
    backToTopBtn = newBtt;
    bttText = backToTopBtn.querySelector('.btt-text'); 

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// 3. 全局事件监听
window.removeEventListener('scroll', handleScroll);
window.addEventListener('scroll', handleScroll);

// [新增] 全局点击监听，判断是否点击了分页导航
document.addEventListener('click', function(e) {
  // 检查点击的目标元素是否在 .page-nav 分页容器内部
  if (e.target.closest('.page-nav')) {
    isPaginationClick = true;
  }
});

// 4. 生命周期初始化
document.addEventListener('DOMContentLoaded', function() {
  
  if (window.Pjax) {
    pjax = new Pjax({
      selectors: [
        "title",
        "#pjax-container",
        ".nav-right",
        ".air-sidebar"
      ],
      cacheBust: false,
      analytics: false,
      scrollTo: false 
    });
  }

  initAIRTheme();
  initBackToTop();
});

document.addEventListener('pjax:success', function() {
  initAIRTheme();
  initBackToTop(); 

  // [修改] Pjax 跳转后的滚动逻辑修复
  // 1. 获取首页 Hero 元素 (仅首页/首页分页存在)
  var homeHeader = document.getElementById('home-header');
  var mainContent = document.getElementById('main-content');
  
  // 2. 判断是否为 "翻页" 状态 (URL包含分页特征)
  var isPaginationUrl = /\/(page|p)\/\d+/.test(window.location.pathname);

  // 3. 只有当：存在 Hero (首页模板) 且 (是URL分页状态 OR 是通过点击分页器跳转的) 时，才跳转到内容区
  if (homeHeader && mainContent && (isPaginationUrl || isPaginationClick)) {
      // Case A: 首页的分页跳转 (含跳回第一页)，跳过 Hero，直接滚动到文章列表
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
      // Case B: 其他情况 (回到真正的首页、文章页、归档页等)，直接回顶
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  // 重置点击标记
  isPaginationClick = false;
});

console.log('AIR-v3 theme loaded with Pjax.');