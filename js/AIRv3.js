// 声明全局 pjax 变量
var pjax;

// 1. 定义初始化函数 (处理每次页面切换后需要运行的逻辑)
function initAIRTheme() {
  
  // --- 背景模糊控制 ---
  var fixedBg = document.querySelector('.fixed-bg');
  var isPostPage = document.querySelector('.post-page-card'); 
  
  if (fixedBg) {
    if (isPostPage) {
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

  // --- 初始化归档页搜索功能 ---
  if (typeof initArchiveSearch === 'function') {
    initArchiveSearch();
  } else if (document.getElementById('archive-search')) {
      // 容错：如果 initArchiveSearch 尚未定义（可能是加载顺序问题），这里可以内联或者稍后执行
      // 通常 AIRv3.js 包含所有逻辑，所以直接调用下面的定义即可
      initArchiveSearch();
  }

  // --- TOC 链接平滑滚动逻辑 ---
  if (typeof initTocSmoothScroll === 'function') {
    initTocSmoothScroll();
  } else {
      initTocSmoothScroll();
  }

  // --- [新增] Highlight.js 初始化 ---
  // 检查 hljs 是否已加载
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el);
    });
  }
}

// [新增] TOC 平滑滚动处理函数
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
  window.scrollTo(0, 0); 
});

console.log('AIR-v3 theme loaded with Pjax.');