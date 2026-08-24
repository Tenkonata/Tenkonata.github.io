/**
 * ----------------------------------------------------------------
 * 移动端菜单与工具 (PJAX 兼容) - 动态注入版
 * ----------------------------------------------------------------
 * * 说明:
 * 1. 自动创建并注入: 汉堡按钮 (fa-bars), 夜间模式切换按钮, 遮罩层
 * 2. 依赖 layout.ejs 在 onPageReady 时调用 window.initMobileLayout
 */

(function() {
    'use strict';

    // --- 1. 元素创建 (只执行一次) ---
    
    let isInitialized = false;
    let toggleButton = null; // 菜单按钮
    let themeButton = null;  // 主题按钮
    let overlay = null;

    function createMobileElements() {
        if (isInitialized) return;

        // 1.1 创建遮罩层
        overlay = document.createElement('div');
        overlay.id = 'mobile-overlay';
        document.body.appendChild(overlay);

        // 1.2 创建汉堡按钮 (使用 FontAwesome)
        toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle navigation');
        // [修复] 使用 fa-bars 图标
        toggleButton.innerHTML = '<i class="fa fa-bars"></i>';

        // 1.3 [新增] 创建夜间模式切换按钮
        themeButton = document.createElement('button');
        themeButton.className = 'mobile-theme-toggle';
        themeButton.setAttribute('aria-label', 'Toggle Dark Mode');
        // 初始图标 (根据当前是否是 dark-mode 设置)
        const isDark = document.body.classList.contains('dark-mode');
        themeButton.innerHTML = isDark ? '<i class="fa fa-sun-o"></i>' : '<i class="fa fa-moon-o"></i>';
        
        // 1.4 注入按钮到 nav.ejs 的 .nav-content 中
        const navContent = document.querySelector('.nav-content');
        if (navContent) {
            // 注意顺序：先放主题按钮，再放菜单按钮，靠右排列
            navContent.appendChild(themeButton);
            navContent.appendChild(toggleButton);
        } else {
            console.error('Mobile.js: 未找到 .nav-content 来注入按钮。');
            return;
        }
        
        // 1.5 绑定事件监听 (使用事件委托)
        document.body.addEventListener('click', handleMobileEvents);
        
        isInitialized = true;
        console.log("Mobile.js: 移动端组件已注入。");
    }

    // --- 2. 事件处理 ---

    function handleMobileEvents(e) {
        const aside = document.getElementById('aside');
        
        // A. 处理菜单切换
        const clickedMenuBtn = e.target.closest('.mobile-menu-toggle');
        const clickedOverlay = e.target.closest('#mobile-overlay');
        
        if (aside && overlay) {
            if (clickedMenuBtn) {
                e.preventDefault();
                aside.classList.toggle('mobile-open');
                overlay.classList.toggle('mobile-overlay-open');
                return;
            }
            // 点击遮罩层关闭
            if (clickedOverlay && aside.classList.contains('mobile-open')) {
                e.preventDefault();
                aside.classList.remove('mobile-open');
                overlay.classList.remove('mobile-overlay-open');
                return;
            }
            // 点击侧边栏链接关闭
            const postLink = e.target.closest('.post-link');
            if (postLink && aside.classList.contains('mobile-open')) {
                aside.classList.remove('mobile-open');
                overlay.classList.remove('mobile-overlay-open');
                return;
            }
        }

        // B. [新增] 处理夜间模式切换
        const clickedThemeBtn = e.target.closest('.mobile-theme-toggle');
        if (clickedThemeBtn) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // 更新图标 (月亮 <-> 太阳)
            clickedThemeBtn.innerHTML = isDark ? '<i class="fa fa-sun-o"></i>' : '<i class="fa fa-moon-o"></i>';
            return;
        }
    }

    // --- 3. PJAX 回调 ---
    
    function checkMobileButtonVisibility() {
        if (!isInitialized || !toggleButton || !themeButton) return;

        // 每次页面跳转后，确保主题图标状态正确 (防止不同步)
        const isDark = document.body.classList.contains('dark-mode');
        themeButton.innerHTML = isDark ? '<i class="fa fa-sun-o"></i>' : '<i class="fa fa-moon-o"></i>';

        // [修改] 增强的主页判断逻辑 (JS 独立判断)
        // 优先检查 body 类名，其次检查 URL 路径，确保在 Pjax/Back 操作中万无一失
        const path = window.location.pathname.replace(/\/$/, '');
        const isHomePage = document.body.classList.contains('home-layout') || 
                          path === '' || 
                          path === '/index.html';

        if (isHomePage) {
            // 主页：通过 JS 强制隐藏移动端组件
            // 使用 setProperty('display', 'none', 'important') 确保覆盖 CSS
            toggleButton.style.setProperty('display', 'none', 'important');
            themeButton.style.setProperty('display', 'none', 'important');
            
            // 额外保险：如果检测到主页，强制清理所有移动端打开状态 (防止遮罩层残留)
            const aside = document.getElementById('aside');
            const overlay = document.getElementById('mobile-overlay');
            if (aside && aside.classList.contains('mobile-open')) {
                aside.classList.remove('mobile-open');
            }
            if (overlay && overlay.classList.contains('mobile-overlay-open')) {
                overlay.classList.remove('mobile-overlay-open');
            }
        } else {
            // 非主页：移除内联样式，交还给 CSS 控制
            toggleButton.style.removeProperty('display');
            themeButton.style.removeProperty('display');
        }
    }

    // 暴露给全局
    window.initMobileLayout = checkMobileButtonVisibility;

    // --- 4. 启动 ---
    
    // [新增] 监听 popstate 事件 (浏览器后退/前进)
    // 即使 Pjax 有时处理不及时，原生事件也能触发状态检查
    window.addEventListener('popstate', function() {
        // 稍微延迟一下，等待 DOM 可能的变化
        setTimeout(checkMobileButtonVisibility, 50);
    });
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createMobileElements();
            checkMobileButtonVisibility();
        });
    } else {
        createMobileElements();
        checkMobileButtonVisibility();
    }

})();