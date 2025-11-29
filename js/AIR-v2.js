document.addEventListener('DOMContentLoaded', function() {
    console.log("Pjax: Attaching one-time delegated listeners.");

    // (保持不变) 找到静态父元素
    const pjaxContainer = document.getElementById('pjax-container');
    
    if (!pjaxContainer) {
        console.error("Pjax 严重错误: 未找到静态容器 #pjax-container！");
        return;
    }

    // --- (保持不变) 修复1: 侧边栏文件夹点击 (事件委托) ---
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


    // --- (保持不变) 修复3: 侧边栏选项卡 (文件/大纲) 点击 (事件委托)
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

    // --- (保持不变) 修复4: 窗口大小调整 (一次性) ---
    if (window.initMobileLayout) { // 安全检查
       window.addEventListener('resize', window.initMobileLayout);
    }


    // ==========================================================
    // 回到顶部按钮逻辑
    // ==========================================================
    // 1. 全局点击监听 (不依赖 jQuery，也不依赖 Pjax 刷新)
    document.body.addEventListener('click', function(e) {
        // 检查点击的目标是否是 #back-to-top 或者其内部元素
        const btn = e.target.closest('#back-to-top');
        if (btn) {
            e.preventDefault(); // 防止可能的默认行为
            // 原生平滑滚动
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // 2. 滚动监听
    let currentScrollHandler = null;

    function initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        
        // 如果页面上找不到按钮，清除旧监听器并退出
        if (!backToTopBtn) {
            if (currentScrollHandler) {
                window.removeEventListener('scroll', currentScrollHandler);
                currentScrollHandler = null;
            }
            return;
        }

        // 定义处理函数
        const handleScroll = function() {
            // 兼容性写法获取滚动高度
            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

            if (scrollTop > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        };

        // 移除旧监听器，防止重复绑定
        if (currentScrollHandler) {
            window.removeEventListener('scroll', currentScrollHandler);
        }

        // 绑定新监听器
        currentScrollHandler = handleScroll;
        window.addEventListener('scroll', currentScrollHandler);
        
        // 立即检查一次状态
        handleScroll();
    }

    // 初始化
    initBackToTop();

    // 【关键修改】使用 jQuery 监听 Pjax 完成事件
    // 因为 Pjax 插件触发的是 jQuery 事件，原生 document.addEventListener 无法捕获
    $(document).on('pjax:complete', function() {
        initBackToTop();
    });

}); // 结束 DOMContentLoaded