const previewFrame = document.getElementById('reference');
const pr = document.getElementById('pr');
const ed = document.getElementById('ed');
const help = document.getElementById('instructions');
const timerBtn = document.getElementById('timerBtn');
const timerInput = document.getElementById('timerInput');
const upload = document.getElementById('upload');
import {timersRun, countdown} from './coutdown.js';
const editorTabBtns = document.querySelectorAll(".editortab-btns > .tab-btns__item");
for ( let i = 0; i < editorTabBtns.length; i++) {
    editorTabBtns[i].addEventListener('click', (e) => openTab(e, e.target.textContent, ".editors"));
}
const helpTabBtns = document.querySelectorAll(".helptab-btns > .tab-btns__item");
for ( let i = 0; i < helpTabBtns.length; i++) {
    helpTabBtns[i].addEventListener('click', (e) => openTab(e, e.target.textContent, ".display-area"));
}
const dashboardItems = document.querySelectorAll(".dashboard > .dashboard__item");
for ( let i = 0; i < dashboardItems.length; i++) {
  dashboardItems[i].addEventListener('click', (e) => shiftPointer(e));
}
const editors = {};
editors.htmlTab = CodeMirror.fromTextArea(htmlEditor, 
{
    mode : "xml",
    htmlMode: true,
    lineNumbers: true,
    lineWrapping: true,
    profile: 'xhtml',
    theme: "monokai"
});
editors.cssTab = CodeMirror.fromTextArea(cssEditor, 
{ mode:  "css",
  lineNumbers: true,
  lineWrapping: true,
  theme: "monokai"
});
emmetCodeMirror(editors.htmlTab);
emmetCodeMirror(editors.cssTab);
editors.htmlTab.focus();
timerBtn.addEventListener('click', (e) => {
  switch (e.target.textContent) {
    case "start":
      timersRun(timerInput);
      timerBtn.textContent = 'preview';
      break;
    case "preview":
      if (editors.htmlTab.getValue()) {
        clearInterval(countdown);
        openTab(helpTabBtns[1], "reference", ".display-area");
        switchWidth(ed);
        timerBtn.textContent = 'back';
        previewInFrame();
      } else {
        alert('no html content');
      }
      break;
    case "back":
      switchWidth(ed);
      timerBtn.textContent = 'preview';
      break;
    default:
      alert('wrong timer');
      break;
  }
});
timerInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
      e.preventDefault();
      timersRun(timerInput);
      timerBtn.textContent = 'preview';
  }
});
upload.addEventListener('click', function(e) {
  shiftPointer(e);
});
upload.addEventListener('change', function(e) {
  if (e.target.files.length > 0) {
    let instructions = '<h2 class="helpers__title"> Instructions</h2>';
    let files = e.target.files;
    let refInd = 0;
    let fileSize = files[0].size;
    for (let i = 1; i < files.length; i++) {
      if (files[i].size > fileSize){
        fileSize = files[i].size;
        refInd = i;
      }
    }
    for (let index = 0; index < files.length; index++) {
      let file = files[index]; 
      if(file.name.search(/[\w- ]+\.(jpe?g|png|webp)/i) != -1) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
          reader.onload = function(e){
          if( e.target.readyState == FileReader.DONE) {
            if (index != refInd) {
              localStorage.setItem(file.name, e.target.result);
            } else {
              pr.style.backgroundImage = `url(${e.target.result})`;
            }
          }
        }
      } else if (file.name.search(/[\w- ]+\.html/i) != -1) {
        const reader = new FileReader();
        reader.readAsText(file);
          reader.onload = function(e){
            if( e.target.readyState == FileReader.DONE) {
              instructions += `${e.target.result}`;
              help.innerHTML = `${instructions}`;
            }
          }
      } else if (file.name.search(/[\w- ]+\.(woff2?|ttf|otf)/i) != -1) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
          reader.onload = function(e){
            if( e.target.readyState == FileReader.DONE) {
              const splited = file.name.split('.');
              let loadingFont = new FontFace(splited[0], e.target.result);
              previewFrame.contentDocument.fonts.add(loadingFont);
            }
          }
      } else if (file.name.search(/[\w- ]+\.json/i) != -1) {
        const reader = new FileReader();
        reader.readAsText(file);
          reader.onload = function(e){
            if( e.target.readyState == FileReader.DONE) {
              let task = JSON.parse(e.target.result);
              instructions += atob(task.instructions);
              help.innerHTML = instructions;
              pr.style.backgroundImage = `url(${task.refImage})`;
              for (const asset of task.assets) {
                localStorage.setItem(asset.name, asset.content);
              }
            }
          }
      } else {
          alert("incorrect file type");
      }
    }
  }
})

document.onkeyup = (e) => {
  if (e.altKey && e.which == 72) {
    openTab(editorTabBtns[0], "html", ".editors");
    editorTabBtns[0].focus();
  } else if (e.altKey && e.which == 67) {
    openTab(editorTabBtns[1], "css", ".editors");
    editorTabBtns[1].focus();
    } else if (e.altKey && e.which == 73) {
    openTab(helpTabBtns[0], "instructions", ".display-area");
    helpTabBtns[0].focus();
    } else if (e.altKey && e.which == 82) {
    openTab(helpTabBtns[1], "reference", ".display-area");
    helpTabBtns[1].focus();
    }
};

function switchWidth(el) {
  el.classList.toggle('isHide');
}
function loadCss() {
  const head = previewFrame.contentDocument.head;  
  head.innerHTML = `<style> ${editors.cssTab.getValue()} </style>`;
  if (head.firstChild.sheet.cssRules.length) {
    const rules = head.firstChild.sheet.cssRules;
    for (let rule = 0; rule < rules.length; rule++) {
      const bgi = rules[rule].style.backgroundImage;
      const bg = rules[rule].style.background;
      const bgRg = /[\w- ]+\.(jpe?g|png|webp)/ig;
      if (bgi) {
        const img = bgi.match(bgRg);
        if (img) {
          for (let i = 0; i < img.length; i++) {
            let currentValue = rules[rule].style.backgroundImage;
            rules[rule].style.backgroundImage = nameToDataURL(img[i], currentValue);
          }
        } 
      }
      if (bg) {
        const img = bg.match(bgRg);
        if (img) {
          for (let i = 0; i < img.length; i++) {
            let currentValue = rules[rule].style.background;
            rules[rule].style.background = nameToDataURL(img[i], currentValue);
          }
        } 
      }
    }
  }
}
function nameToDataURL(name, str) {
  const itemLS = localStorage.getItem(name);
  const replaced = str.replace(name, itemLS);
  return replaced;
}
function shiftPointer(e) {
  const obj = e.target || e;
  const transformData = obj.dataset.dist;
  if (obj.parentNode.nodeName == 'LABEL') {
    obj.parentNode.parentNode.lastElementChild.style.transform = `translateX(${transformData}%)`;
    return;
  }
  obj.parentNode.lastElementChild.style.transform = `translateX(${transformData}%)`;
}
function openTab(e, tabName, tabContainer) {
  const tabcontent = document.querySelectorAll(tabContainer + " > .tab-content");
    for ( let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    const activeTab = document.getElementById(tabName);
    activeTab.style.display = "block";
    if (activeTab.parentNode.classList.contains('editors')) {
      let activeTabName = `${tabName}Tab`;
      editors[activeTabName].refresh();
    }
    shiftPointer(e);
}
function previewInFrame() {
  const preview = previewFrame.contentWindow.document;
    preview.open();
    preview.write(editors.htmlTab.getValue());
    loadCss();
    let imgs = preview.querySelectorAll('img');
    imgs.forEach(img => {
      for (let index = 0; index < img.attributes.length; index++) {
        if (img.attributes[index].name == "src") {
          let i = localStorage.getItem(img.attributes[index].value);
          img.setAttribute("src", i);
          return;
        }
      }
    });
    preview.close();
}