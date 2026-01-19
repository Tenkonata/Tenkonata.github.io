// ==========================================================
// 核心函数定义
// ==========================================================

// 1. 生成大纲 (Pjax 切换后专用)
// 首次加载由 SSR 完成，此函数仅在 Pjax 局部刷新正文后，负责重新计算大纲
window.generateOutline = function() {
    const outlineWrapper = document.querySelector('.outline-container');
    const content = document.getElementById('content');
    
    if (!outlineWrapper || !content) return;

    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
        outlineWrapper.innerHTML = '<div class="no-outline">暂无大纲</div>';
    }
    else{
        let listHTML = '<ul class="outline-list" style="margin: 0; padding: 0;">';
        headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent;
        const id = heading.id || `heading-${index}`;
        if (!heading.id) heading.id = id;
    
        listHTML += `
            <li class="outline-item outline-level-${level}" style="margin: 0; padding: 0;">
                <a href="#${id}" class="outline-link">${text}</a>
            </li>
        `;
    });
    listHTML += '</ul>';
    
    // 直接覆盖，无需比对
    outlineWrapper.innerHTML = `<div id="article-outline">${listHTML}</div>`;
    }
    
    
    // 自动切换到大纲 Tab 并播放动画
    const sidebar = document.querySelector('.sidebar');
    const outlineTab = document.getElementById('outline-tab');
    const outlineBtn = document.querySelector('.tab-btn[data-tab="outline"]');
        
    if (sidebar && outlineTab && outlineBtn) {
        // 清除旧状态
        sidebar.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        // 激活新状态
        outlineTab.classList.add('active');
        outlineBtn.classList.add('active');
        // 播放动画
        outlineTab.animate([
            {opacity: 0, transform: 'translateY(5px)'}, 
            {opacity: 1, transform: 'none'}
        ], {duration: 200});
    }
};

// 2. 代码高亮
window.initHighlight = function() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
    }
};

// 3. 更新侧边栏活动状态 (从 layout.ejs 移入，统一管理)
window.updateSidebarActiveState = function() {
    // 移除旧激活状态
    document.querySelectorAll('.post-item.active').forEach(item => item.classList.remove('active'));
    
    const currentPath = window.location.pathname.replace(/\/$/, '');
    
    // 查找匹配链接
    document.querySelectorAll('.post-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (href.replace(/\/$/, '') === currentPath) {
            // 激活当前项
            link.closest('.post-item').classList.add('active');
            
            // 递归展开所有父级文件夹
            let parent = link.closest('.category-group');
            while (parent) {
                parent.classList.remove('collapsed');
                const icon = parent.querySelector('.category-title i');
                if (icon) icon.className = 'fa fa-folder-open';
                parent = parent.parentElement.closest('.category-group');
            }
        }
    });
};

// ==========================================================
// 主程序入口
// ==========================================================

// 夜间模式预加载
(function() {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
})();

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 初始化功能 (首次加载)
    // 注意：generateOutline 不需要调用，因为 SSR 已经生成了
    window.initHighlight();
    window.updateSidebarActiveState();

    // 2. 恢复侧边栏折叠状态
    const storedState = localStorage.getItem('hexo-sidebar-state');
    if (storedState) {
        try {
            const list = JSON.parse(storedState);
            if (Array.isArray(list)) {
                document.querySelectorAll('.category-group').forEach(group => {
                    const title = group.querySelector('.category-title');
                    if (title && list.includes(title.textContent.trim())) {
                        group.classList.add('collapsed');
                        group.querySelector('i').className = 'fa fa-folder';
                    }
                });
            }
        } catch(e) {}
    }

    // 3. 事件委托 (集中处理点击事件)
    document.addEventListener('click', function(e) {
        const target = e.target;

        // 大纲跳转
        if (target.classList.contains('outline-link')) {
            e.preventDefault();
            const id = target.getAttribute('href').substring(1);
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
            return;
        }

        // 文件夹折叠
        const title = target.closest('.category-title');
        if (title) {
            const group = title.closest('.category-group');
            if (group) {
                group.classList.toggle('collapsed');
                const icon = title.querySelector('i');
                icon.className = icon.className.includes('open') ? 'fa fa-folder' : 'fa fa-folder-open';
                
                // 保存状态
                const collapsed = [];
                document.querySelectorAll('.category-group.collapsed .category-title').forEach(t => collapsed.push(t.textContent.trim()));
                localStorage.setItem('hexo-sidebar-state', JSON.stringify(collapsed));
            }
            return;
        }

        // Tab 切换
        const tabBtn = target.closest('.tab-btn');
        if (tabBtn) {
            const id = tabBtn.getAttribute('data-tab');
            const sidebar = tabBtn.closest('.sidebar');
            
            sidebar.querySelectorAll('.tab-btn.active, .tab-content.active').forEach(el => el.classList.remove('active'));
            tabBtn.classList.add('active');
            
            const content = sidebar.querySelector(`#${id}-tab`);
            if (content) {
                content.classList.add('active');
                content.animate([{opacity:0, transform: 'translateY(5px)'}, {opacity:1, transform: 'none'}], {duration: 200});
            }
            return;
        }

        // 夜间模式切换
        if (target.closest('.author-avatar')) {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            return;
        }
    });

    // 4. 回到顶部滚动监听
    const btt = document.getElementById('back-to-top');
    if (btt) {
        window.addEventListener('scroll', () => {
            btt.classList.toggle('show', window.scrollY > 300);
        });
        btt.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    }
});