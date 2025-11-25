/**
 * ----------------------------------------------------------------
 * 移動端菜單 (PJAX 兼容) - 動態注入版
 * ----------------------------------------------------------------
 * * 說明:
 * 1. 此腳本會自動創建並注入 漢堡按鈕 和 遮罩層。
 * 2. 依賴 layout.ejs 在 onPageReady 時調用 window.initMobileLayout。
 */

(function() {
    'use strict';

    // --- 1. 元素創建 (只執行一次) ---
    
    let isInitialized = false;
    let toggleButton = null;
    let overlay = null;

    function createMobileElements() {
        if (isInitialized) return;

        // 1.1 創建遮罩層
        overlay = document.createElement('div');
        overlay.id = 'mobile-overlay';
        document.body.appendChild(overlay);

        // 1.2 創建漢堡按鈕
        toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle navigation');
        toggleButton.innerHTML = '<span></span><span></span><span></span>';
        
        // 1.3 注入漢堡按鈕到 nav.ejs 的 .nav-content 中
        const navContent = document.querySelector('.nav-content');
        if (navContent) {
            navContent.appendChild(toggleButton);
        } else {
            console.error('Mobile.js: 未找到 .nav-content 來注入按鈕。');
            return;
        }
        
        // 1.4 綁定一次性事件監聽 (使用事件委託)
        document.body.addEventListener('click', handleMobileMenu);
        
        isInitialized = true;
        console.log("Mobile.js: 漢堡按鈕和遮罩層已創建並注入。");
    }

    // --- 2. 事件處理 (事件委託) ---

    function handleMobileMenu(e) {
        // 檢查點擊的是否是我們動態創建的按鈕或遮罩層
        const isToggleButton = e.target.closest('.mobile-menu-toggle');
        const isOverlay = e.target.closest('#mobile-overlay');
        const aside = document.getElementById('aside');

        if (!aside || !overlay) {
            // 如果在主頁 (沒有側邊欄) 或元素不存在
             if (isToggleButton) e.preventDefault();
            return;
        }

        if (isToggleButton) {
            e.preventDefault();
            aside.classList.toggle('mobile-open');
            overlay.classList.toggle('mobile-overlay-open');
        } else if (isOverlay && aside.classList.contains('mobile-open')) {
            e.preventDefault();
            aside.classList.remove('mobile-open');
            overlay.classList.remove('mobile-overlay-open');
        }
        
        const postLink = e.target.closest('.post-link');
        if (postLink && aside.classList.contains('mobile-open')) {
            // 點擊側邊欄鏈接，關閉菜單
            aside.classList.remove('mobile-open');
            overlay.classList.remove('mobile-overlay-open');
        }
    }

    // --- 3. PJAX 回調 (由 layout.ejs 調用) ---
    
    function checkMobileButtonVisibility() {
        if (!isInitialized || !toggleButton) {
            // 如果 PJAX 先於 DOMContentLoaded 運行 (不太可能, 但作為安全檢查)
            return; 
        }

        // 檢查 .home-layout 是否存在 (用於主頁契合)
        const isHomePage = document.body.classList.contains('home-layout');

        if (isHomePage) {
            // 如果是主頁，隱藏按鈕
            toggleButton.style.display = 'none';
        } else {
            // 如果是其他頁面 (文章頁等)，顯示按鈕
            // (CSS 媒體查詢會決定它在桌面還是移動端顯示)
            toggleButton.style.display = ''; // 移除 JS 設置，交給 CSS 控制
        }
    }

    // 暴露 PJAX 回調函數給 layout.ejs
    window.initMobileLayout = checkMobileButtonVisibility;

    // --- 4. 啟動 ---
    
    // 確保在 DOM 加載後才創建元素
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createMobileElements();
            checkMobileButtonVisibility(); // 首次加載時檢查
        });
    } else {
        // DOM 已經加載
        createMobileElements();
        checkMobileButtonVisibility(); // 首次加載時檢查
    }

})();