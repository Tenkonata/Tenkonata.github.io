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

  // --- 向下滚动按钮 (位于 Pjax 容器内，每次 Pjax 重新拉取的节点是干净的) ---
  var scrollBtn = document.getElementById('scroll-down-btn');
  var mainContent = document.querySelector('.post-list-section'); 

  if (scrollBtn && mainContent) {
    scrollBtn.addEventListener('click', function(e) {
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
  initArchiveSearch();

  // --- TOC 链接平滑滚动逻辑 ---
  initTocSmoothScroll();

  // --- [顺序调整] Highlight.js 初始化 (先高亮) ---
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el);
    });
  }
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
  if (!backToTopBtn) return;

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
  if (backToTopBtn) {
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

// 主题切换逻辑与平滑过渡
function initThemeToggle() {
  var toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  var icon = toggleBtn.querySelector('i');
  
  if (document.documentElement.classList.contains('light-mode')) {
    icon.classList.remove('fa-moon-o');
    icon.classList.add('fa-sun-o');
  }

  toggleBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    var isLightBefore = document.documentElement.classList.contains('light-mode');

    function executeThemeSwitch() {
      document.documentElement.classList.toggle('light-mode');
      var isLight = document.documentElement.classList.contains('light-mode');
      if (isLight) {
        localStorage.setItem('air-theme-mode', 'light');
        icon.classList.remove('fa-moon-o');
        icon.classList.add('fa-sun-o');
      } else {
        localStorage.setItem('air-theme-mode', 'dark');
        icon.classList.remove('fa-sun-o');
        icon.classList.add('fa-moon-o');
      }
    }

    // 现代浏览器 View Transitions API (涟漪特效)
    if (document.startViewTransition) {
      document.documentElement.classList.remove('theme-transition'); // 关闭普通渐变
      
      const x = e.clientX || window.innerWidth / 2;
      const y = e.clientY || window.innerHeight / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      
      document.documentElement.style.setProperty('--x', x + 'px');
      document.documentElement.style.setProperty('--y', y + 'px');
      document.documentElement.style.setProperty('--r', radius + 'px');
      
      document.startViewTransition(() => {
        executeThemeSwitch();
      });
    } else {
      // 降级兼容旧版浏览器：原生平滑渐变
      document.documentElement.classList.add('theme-transition');
      executeThemeSwitch();
      setTimeout(function() {
        document.documentElement.classList.remove('theme-transition');
      }, 450);
    }
  });
}

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

  initThemeToggle();
  initAIRTheme();
  initBackToTop();
});

document.addEventListener('pjax:success', function() {
  initAIRTheme();

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

