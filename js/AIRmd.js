/* ==========================================================================
   AIR-v3 Markdown 专属交互脚本 (AIRmd.js)
   说明: 专门处理 Markdown 渲染后的正文交互（代码复制、Alert等）
   ========================================================================== */

function initAIRMarkdown() {
  initCodeBlocks();
  renderMarkdownAlerts();
  renderTaskLists();
}

function initCodeBlocks() {
  var preTags = document.querySelectorAll('.post-content pre');
  preTags.forEach(function(pre) {
    if (pre.querySelector('.copy-btn')) return;
    var code = pre.querySelector('code');
    if (!code) return; 
    var langName = 'TEXT';
    var classes = code.className.split(/\s+/);
    classes.forEach(function(cls) {
      if (cls === 'hljs') return; 
      if (cls.startsWith('language-')) {
        langName = cls.replace('language-', '').toUpperCase();
      } else if (cls.startsWith('lang-')) {
        langName = cls.replace('lang-', '').toUpperCase();
      } else if (cls.length > 0 && langName === 'TEXT') {
        langName = cls.toUpperCase();
      }
    });
    if (langName === 'TEXT') {
        var preClasses = pre.className.split(/\s+/);
        preClasses.forEach(function(cls) {
             if (cls.startsWith('language-') || cls.startsWith('lang-')) {
                langName = cls.replace(/^language-|^lang-/, '').toUpperCase();
             }
        });
    }
    var langTag = document.createElement('span');
    langTag.className = 'code-lang-tag';
    langTag.innerText = langName;
    pre.appendChild(langTag);
    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
    copyBtn.addEventListener('click', function() {
      var codeText = code.innerText; 
      if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(codeText).then(function() { showCopiedState(copyBtn); })
          .catch(function() { fallbackCopyTextToClipboard(codeText, copyBtn); });
      } else {
          fallbackCopyTextToClipboard(codeText, copyBtn);
      }
    });
    pre.appendChild(copyBtn);
  });
}

function showCopiedState(btn) {
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fa fa-check"></i>';
    setTimeout(function() {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fa fa-copy"></i>'; 
    }, 2000);
}

function fallbackCopyTextToClipboard(text, btn) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try { if (document.execCommand('copy')) showCopiedState(btn); } catch (err) {}
  document.body.removeChild(textArea);
}

function renderMarkdownAlerts() {
  var blockquotes = document.querySelectorAll('.post-content blockquote');
  blockquotes.forEach(function(quote) {
    var firstP = quote.querySelector('p');
    if (!firstP) return;
    
    var html = firstP.innerHTML;
    // 允许开头有空白符，容忍任意格式的换行或空白或 <br> 标签
    var match = html.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?\s*([\s\S]*)$/i);
    
    if (match) {
      var type = match[1].toLowerCase();
      var restOfHtml = match[2];
      
      quote.classList.add('markdown-alert', 'markdown-alert-' + type);
      var icon = 'fa-info-circle';
      var titleText = type.charAt(0).toUpperCase() + type.slice(1);
      
      if (type === 'tip') icon = 'fa-lightbulb-o';
      if (type === 'important') icon = 'fa-exclamation-circle';
      if (type === 'warning') icon = 'fa-exclamation-triangle';
      if (type === 'caution') icon = 'fa-ban';
      
      var titleHtml = '<div class="markdown-alert-title"><i class="fa ' + icon + '"></i>' + titleText + '</div>';
      firstP.innerHTML = titleHtml + restOfHtml;
    }
  });
}


// =========================================
// Task Lists Parser (- [ ] / - [x])
// =========================================
function renderTaskLists() {
  var listItems = document.querySelectorAll('.post-content li');
  listItems.forEach(function(li) {
    var html = li.innerHTML;
    // 匹配可选空白和可选的<p>标签，后接 [ ] 或 [x]
    if (/^\s*(<p>)?\s*\[ \]\s+/i.test(html)) {
      li.innerHTML = html.replace(/^(\s*(?:<p>)?\s*)\[ \]\s+/i, '$1<input type="checkbox" disabled class="md-task-checkbox"> ');
      li.classList.add('md-task-list-item');
      li.parentElement.classList.add('md-task-list');
    } else if (/^\s*(<p>)?\s*\[x\]\s+/i.test(html)) {
      li.innerHTML = html.replace(/^(\s*(?:<p>)?\s*)\[x\]\s+/i, '$1<input type="checkbox" disabled checked class="md-task-checkbox"> ');
      li.classList.add('md-task-list-item');
      li.parentElement.classList.add('md-task-list');
    }
  });
}

document.addEventListener("DOMContentLoaded", initAIRMarkdown);
document.addEventListener("pjax:success", initAIRMarkdown);
document.addEventListener("pjax:success", initAIRMarkdown);

