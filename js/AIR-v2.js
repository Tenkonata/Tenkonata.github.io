// 1. 初始化夜間模式狀態 (盡早執行避免閃爍)
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log("Pjax: Attaching one-time delegated listeners.");

    const pjaxContainer = document.getElementById('pjax-container');
    
    if (!pjaxContainer) {
        console.error("Pjax 嚴重錯誤: 未找到靜態容器 #pjax-container！");
        return;
    }

    // ==========================================================
    // 側邊欄狀態保存與恢復邏輯 (LocalStorage)
    // ==========================================================
    function saveSidebarState() {
        const collapsedPaths = [];
        // 查找所有被折疊的分類組
        document.querySelectorAll('.category-group.collapsed .category-title').forEach(title => {
            // 使用 textContent 獲取分類名稱作為唯一標識
            collapsedPaths.push(title.textContent.trim());
        });
        localStorage.setItem('hexo-sidebar-state', JSON.stringify(collapsedPaths));
    }

    function restoreSidebarState() {
        const stored = localStorage.getItem('hexo-sidebar-state');
        if (!stored) return;
        
        try {
            const collapsedPaths = JSON.parse(stored);
            if (!Array.isArray(collapsedPaths)) return;

            // 【關鍵修復】創建並注入樣式，臨時禁用動畫
            // 這能防止瀏覽器播放“從展開到收起”的過渡動畫，消除閃爍
            const noTransitionStyle = document.createElement('style');
            noTransitionStyle.innerHTML = `
                .category-group .post-list { transition: none !important; }
                .category-group .category-title i { transition: none !important; }
            `;
            document.head.appendChild(noTransitionStyle);

            document.querySelectorAll('.category-group').forEach(group => {
                const titleEl = group.querySelector('.category-title');
                if (titleEl) {
                    const name = titleEl.textContent.trim();
                    // 如果該組在保存的折疊列表中
                    if (collapsedPaths.includes(name)) {
                        // 恢復折疊狀態
                        group.classList.add('collapsed');
                        // 修正圖標為閉合狀態 (fa-folder)
                        const icon = titleEl.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-folder-open');
                            icon.classList.add('fa-folder');
                        }
                    }
                }
            });

            // 【關鍵步驟】強制瀏覽器立即進行重繪 (Reflow)
            // 確保在移除禁用樣式的 style 標籤之前，collapsed 類已經生效
            void document.body.offsetHeight;

            // 移除禁用動畫的樣式 (延遲一小段時間確保安全)
            setTimeout(() => {
                if (noTransitionStyle.parentNode) {
                    noTransitionStyle.parentNode.removeChild(noTransitionStyle);
                }
            }, 10);

        } catch (e) {
            console.error('Sidebar state restore failed:', e);
        }
    }

    // 首次加載時恢復狀態
    restoreSidebarState();

    // 【新增】使用 MutationObserver 消除 Pjax 刷新時的閃爍
    // 原理：在 DOM 元素插入但未渲染前立即恢復狀態
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
            // 檢查是否有節點被添加（Pjax 內容替換）
            let hasAddedNodes = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    hasAddedNodes = true;
                    break;
                }
            }
            if (hasAddedNodes) {
                restoreSidebarState();
            }
        });
        
        // 監聽 pjaxContainer 的子節點變化
        observer.observe(pjaxContainer, { childList: true });
    }

    // --- 修復1: 側邊欄文件夾點擊 (事件委託) ---
    pjaxContainer.addEventListener('click', function(e) {
        const title = e.target.closest('.category-title');
        if (title) {
            e.preventDefault();
            const categoryGroup = title.closest('.category-group');
            if (categoryGroup) {
                categoryGroup.classList.toggle('collapsed');
                const icon = title.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('fa-folder')) {
                        icon.classList.replace('fa-folder', 'fa-folder-open');
                    } else if (icon.classList.contains('fa-folder-open')) {
                        icon.classList.replace('fa-folder-open', 'fa-folder');
                    }
                }
                // 狀態改變後立即保存
                saveSidebarState();
            }
        }
    });

    // --- 修復3: 側邊欄選項卡 (文件/大綱) 點擊 (事件委託) ---
    pjaxContainer.addEventListener('click', function(e) {
        const tabButton = e.target.closest('.tab-btn');
        if (!tabButton) return;
        const tabId = tabButton.getAttribute('data-tab');
        if (!tabId) return;
        const sidebar = tabButton.closest('.sidebar');
        if (!sidebar) return;
        
        // 手動點擊：不強制動畫 (false/undefined)
        switchTab(tabId, sidebar); 
    });

    // --- 封裝切換選項卡函數 (增加 isAuto 參數) ---
    function switchTab(tabId, sidebarContext, isAuto) {
        const sidebar = sidebarContext || document.querySelector('.sidebar');
        if (!sidebar) return;

        // 1. 切換按鈕狀態
        const allTabBtns = sidebar.querySelectorAll('.sidebar-header .tab-btn');
        allTabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });

        // 2. 切換內容狀態
        const allTabContents = sidebar.querySelectorAll('.sidebar-nav .tab-content');
        const targetContent = sidebar.querySelector('#' + tabId + '-tab');

        // 【關鍵修復】
        // 手動點擊時 (!isAuto)：如果已經是激活狀態，則忽略（防止重複動畫）。
        // 自動切換時 (isAuto=true)：即使 HTML 默認渲染了 active 類，也繼續向下執行以觸發動畫。
        if (!isAuto && targetContent && targetContent.classList.contains('active')) return;

        // 隱藏所有內容 (先移除 active，確保動畫能從頭開始)
        allTabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 顯示目標內容並播放動畫
        if (targetContent) {
            targetContent.classList.add('active');
            
            // 使用 Web Animations API 播放上浮動畫
            targetContent.animate([
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 350,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // 使用稍微帶點彈性的緩動
                fill: 'forwards'
            });
        }
    }

    // --- 修復4: 窗口大小調整 ---
    if (window.initMobileLayout) {
       window.addEventListener('resize', window.initMobileLayout);
    }

    // ==========================================================
    // 回到頂部按鈕邏輯 (Pjax 適配增強版)
    // ==========================================================
    
    // 1. 全局點擊監聽 (使用委託，無需在 Pjax 後重新綁定)
    document.body.addEventListener('click', function(e) {
        if (e.target.closest('#back-to-top')) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // 2. 滾動處理函數 (動態查找元素)
    // 關鍵點：每次滾動時重新獲取 DOM 元素，而不是依賴閉包中的舊引用
    function handleScroll() {
        const backToTopBtn = document.getElementById('back-to-top');
        // 如果當前頁面沒有這個按鈕（比如被 Pjax 移除了，或者還未加載），直接退出
        if (!backToTopBtn) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    // 3. 綁定滾動事件 (只需綁定一次，永久生效)
    window.addEventListener('scroll', handleScroll);
    // 4. 立即檢查一次狀態
    handleScroll();

    // ==========================================================
    // 夜間模式邏輯 (Dark Mode)
    // ==========================================================
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // 綁定點擊事件 (事件委託，確保 Pjax 後依然有效)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.author-avatar')) {
            toggleDarkMode();
        }
    });

    // ==========================================================
    // Pjax 完成後的回調
    // ==========================================================
    $(document).on('pjax:complete', function() {
        // 1. Pjax 完成後 DOM 已更新，立即調用一次 handleScroll 
        // 確保如果用戶是在頁面中間刷新的，按鈕能正確顯示
        handleScroll();
        
        // 2. 再次恢復狀態作為保險 (雖然 MutationObserver 應該已經處理了)
        restoreSidebarState();
        
        // 3. 再次確認夜間模式狀態 (防止 body class 丟失)
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // 4. 自動切換邏輯 
        const outlineContent = document.getElementById('article-outline');
        switchTab('outline', null, true)
    });

});