/**
 * ----------------------------------------------------------------
 * 1. 全局辅助函数 (Pjax 切换后需要重新运行)
 * ----------------------------------------------------------------
 */

/**
 * ----------------------------------------------------------------
 * 2. Pjax 回调函数 (暴露给 layout.ejs)
 * ----------------------------------------------------------------
 */

/**
 * ----------------------------------------------------------------
 * 3. 一次性事件监听 (使用事件委托)
 * ----------------------------------------------------------------
 */

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
        // 检查被点击的元素(e.target)是否在 .category-title 内部
        const title = e.target.closest('.category-title');
        
        // 如果点击的不是 .category-title, title 将为 null
        if (title) {
            // ... 你的文件夹点击处理逻辑保持不变 ...
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

    // --- (保持不变) 修复2: 移动端按钮点击 (事件委托) ---
    pjaxContainer.addEventListener('click', function(e) {
        // 检查被点击的是否是 .mobile-menu-toggle 按钮
        const toggleButton = e.target.closest('.mobile-menu-toggle');
        
        if (toggleButton) {
            // ... 你的移动端按钮点击处理逻辑保持不变 ...
            const aside = document.getElementById('aside');
            if (aside) {
                aside.classList.toggle('mobile-open');
            }
        }
    });

    // ----------------------------------------------------------------
    // 【【【新增】】】 修复3: 侧边栏选项卡 (文件/大纲) 点击 (事件委托)
    // ----------------------------------------------------------------
    // 我们将监听器绑定在 pjaxContainer 上，它在 Pjax 切换中始终存在
    pjaxContainer.addEventListener('click', function(e) {
        // 1. 检查点击的元素是否是 (或是否在) .tab-btn 内部
        const tabButton = e.target.closest('.tab-btn');

        // 2. 如果点击的不是 tab-btn，则退出
        if (!tabButton) {
            return;
        }

        // 3. 获取要切换的 tab ID (例如 "files" 或 "outline")
        const tabId = tabButton.getAttribute('data-tab');
        if (!tabId) {
            return;
        }

        // 4. 找到父级 .sidebar 元素，以便在正确的范围内查找
        const sidebar = tabButton.closest('.sidebar');
        if (!sidebar) {
            return;
        }

        // --- 开始切换 ---
        
        // 5. 找到 *所有* 按钮，并移除它们的 'active' 状态
        const allTabBtns = sidebar.querySelectorAll('.sidebar-header .tab-btn');
        allTabBtns.forEach(btn => btn.classList.remove('active'));

        // 6. 激活 *被点击* 的按钮
        tabButton.classList.add('active');

        // 7. 找到 *所有* 内容区域，并隐藏它们
        const allTabContents = sidebar.querySelectorAll('.sidebar-nav .tab-content');
        allTabContents.forEach(content => content.classList.remove('active'));

        // 8. 找到 *目标* 内容区域 (ID 对应 tabId)
        const targetContent = sidebar.querySelector('#' + tabId + '-tab');
        if (targetContent) {
            // 9. 显示目标内容
            targetContent.classList.add('active');
        }
    });


    // --- (保持不变) 修复4: 窗口大小调整 (一次性) ---
    window.addEventListener('resize', checkMobileLayout);

}); // 结束 DOMContentLoaded