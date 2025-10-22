/**
 * ----------------------------------------------------------------
 * 1. 全局辅助函数 (Pjax 切换后需要重新运行)
 * ----------------------------------------------------------------
 */

// 全局 resize 检查器
function checkMobileLayout() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (!mobileMenuToggle) return; // 如果按钮不存在，则不执行

    if (window.innerWidth <= 768) {
        mobileMenuToggle.style.display = 'block';
    } else {
        mobileMenuToggle.style.display = 'none';
        const aside = document.getElementById('aside');
        if (aside) {
            aside.classList.remove('mobile-open');
        }
    }
}

// 自动展开当前文章所在的路径
function expandActivePath() {
    const activeItem = document.querySelector('.post-item.file.active');
    if (activeItem) {
        let parent = activeItem.closest('.category-group');
        while (parent) {
            parent.classList.remove('collapsed');
            const icon = parent.querySelector('.category-title i');
            // 确保图标存在再操作
            if (icon && icon.classList.contains('fa-folder')) {
                icon.classList.replace('fa-folder', 'fa-folder-open');
            }
            parent = parent.parentElement.closest('.category-group');
        }
    }
}

// 创建移动端菜单切换按钮 (设为幂等，即重复运行无害)
function createMobileMenuButton() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) return; // #main 不存在，退出

    // 【关键】检查按钮是否已存在，防止 Pjax 重复创建
    if (!mainContainer.querySelector('.mobile-menu-toggle')) {
        const mobileMenuToggle = document.createElement('button');
        mobileMenuToggle.className = 'mobile-menu-toggle';
        mobileMenuToggle.innerHTML = '<i class="fa fa-bars"></i>';
        mobileMenuToggle.style.display = 'none'; // 默认隐藏，由 checkMobileLayout 显示
        mainContainer.prepend(mobileMenuToggle);
    }
}

/**
 * ----------------------------------------------------------------
 * 2. Pjax 回调函数 (暴露给 layout.ejs)
 * ----------------------------------------------------------------
 */

// 此函数将在 layout.ejs 中的 onPageReady() 中被调用
// 它包含了所有 Pjax 切换后 *必须* 重新运行的逻辑
function initSidebarAndMobile() {
    console.log("Pjax: Running initSidebarAndMobile()");
    
    // 1. (重新)创建移动端按钮
    createMobileMenuButton();
    
    // 2. 展开当前激活路径
    expandActivePath();
    
    // 3. 立即检查一次布局，确保按钮正确显示/隐藏
    checkMobileLayout();
}

// 【关键】将函数暴露到全局 window 对象，以便 layout.ejs 可以调用
window.initSidebarAndMobile = initSidebarAndMobile;


/**
 * ----------------------------------------------------------------
 * 3. 一次性事件监听 (使用事件委托)
 * ----------------------------------------------------------------
 */

// 【关键】我们不再使用 DOMContentLoaded 来执行所有操作
// 而是只用它来附加 *一次性* 的 *委托* 事件监听器

document.addEventListener('DOMContentLoaded', function() {
    console.log("Pjax: Attaching one-time delegated listeners.");

    // 找到 *不会* 被 Pjax 替换的静态父元素
    // 根据你的 layout.ejs，这个父元素是 #pjax-container
    const pjaxContainer = document.getElementById('pjax-container');
    
    if (!pjaxContainer) {
        console.error("Pjax 严重错误: 未找到静态容器 #pjax-container！");
        return;
    }

    // --- 修复1: 侧边栏文件夹点击 (事件委托) ---
    // 我们把事件监听器绑定在 pjaxContainer 上，而不是 .category-title
    pjaxContainer.addEventListener('click', function(e) {
        // 检查被点击的元素(e.target)是否在 .category-title 内部
        const title = e.target.closest('.category-title');
        
        // 如果点击的不是 .category-title, title 将为 null
        if (title) {
            e.preventDefault(); // 阻止链接跳转
            const categoryGroup = title.closest('.category-group');
            if (categoryGroup) {
                categoryGroup.classList.toggle('collapsed');
                
                // 切换文件夹图标
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

    // --- 修复2: 移动端按钮点击 (事件委托) ---
    // 同样，把监听器绑定到 pjaxContainer
    pjaxContainer.addEventListener('click', function(e) {
        // 检查被点击的是否是 .mobile-menu-toggle 按钮
        const toggleButton = e.target.closest('.mobile-menu-toggle');
        
        if (toggleButton) {
            const aside = document.getElementById('aside');
            if (aside) {
                aside.classList.toggle('mobile-open');
            }
        }
    });

    // --- 修复3: 窗口大小调整 (一次性) ---
    // 这个监听器绑定到 window，它永远不会被 Pjax 销毁，所以只需绑定一次
    window.addEventListener('resize', checkMobileLayout);

}); // 结束 DOMContentLoaded