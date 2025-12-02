// 1. 初始化夜间模式状态 (尽早执行避免闪烁)
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
        console.error("Pjax 严重错误: 未找到静态容器 #pjax-container！");
        return;
    }

    // --- 修复1: 侧边栏文件夹点击 (事件委托) ---
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
            }
        }
    });

    // --- 修复3: 侧边栏选项卡 (文件/大纲) 点击 (事件委托) ---
    pjaxContainer.addEventListener('click', function(e) {
        const tabButton = e.target.closest('.tab-btn');
        if (!tabButton) return;
        const tabId = tabButton.getAttribute('data-tab');
        if (!tabId) return;
        const sidebar = tabButton.closest('.sidebar');
        if (!sidebar) return;
        const allTabBtns = sidebar.querySelectorAll('.sidebar-header .tab-btn');
        allTabBtns.forEach(btn => btn.classList.remove('active'));
        tabButton.classList.add('active');
        const allTabContents = sidebar.querySelectorAll('.sidebar-nav .tab-content');
        allTabContents.forEach(content => content.classList.remove('active'));
        const targetContent = sidebar.querySelector('#' + tabId + '-tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });

    // --- 修复4: 窗口大小调整 ---
    if (window.initMobileLayout) {
       window.addEventListener('resize', window.initMobileLayout);
    }

    // ==========================================================
    // 回到顶部按钮逻辑 (Pjax 适配增强版)
    // ==========================================================
    
    // 1. 全局点击监听 (使用委托，无需在 Pjax 后重新绑定)
    document.body.addEventListener('click', function(e) {
        if (e.target.closest('#back-to-top')) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // 2. 滚动处理函数 (动态查找元素)
    // 关键点：每次滚动时重新获取 DOM 元素，而不是依赖闭包中的旧引用
    function handleScroll() {
        const backToTopBtn = document.getElementById('back-to-top');
        // 如果当前页面没有这个按钮（比如被 Pjax 移除了，或者还未加载），直接退出
        if (!backToTopBtn) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    // 3. 绑定滚动事件 (只需绑定一次，永久生效)
    window.addEventListener('scroll', handleScroll);
    
    // 4. 立即检查一次状态
    handleScroll();

    // ==========================================================
    // 夜间模式逻辑 (Dark Mode)
    // ==========================================================
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // 绑定点击事件 (事件委托，确保 Pjax 后依然有效)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.author-avatar')) {
            toggleDarkMode();
        }
    });

    // ==========================================================
    // Pjax 完成后的回调
    // ==========================================================
    $(document).on('pjax:complete', function() {
        // 1. Pjax 完成后 DOM 已更新，立即调用一次 handleScroll 
        // 确保如果用户是在页面中间刷新的，按钮能正确显示
        handleScroll();
        
        // 2. 再次确认夜间模式状态 (防止 body class 丢失)
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });

});