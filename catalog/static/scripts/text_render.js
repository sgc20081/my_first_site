function include_str (str, substr, position) {
    let part1 = str.slice(0, position);
    let part2 = str.slice(position, str.length);
    let result = part1 + substr + part2;
    return result
}

/*
========Вариант с рендерингом текста в html 
через обнаружение тегов и создание объектов========

let element = new Array('p', 'br', 'strong', 'em', 
                'ul', 'li', 'ol', 'h1', 'h2',
                'h3', 'h4', 'a', 'img', 'table',
                'tbody', 'tr', 'td');

function render_text () {
    let text_dom = document.querySelector('.text_article');
    let text = text_dom.textContent;
    let tag = '';

    for (let i=0; i < element.length; i++) {
        
        tag = '[' + element[i] + ']';

        if (text.includes(tag)) {

            let end_tag = include_str(tag, '/', 1);
            let element_text = text.substring(
                text.indexOf(tag) + tag.length, text.lastIndexOf(end_tag))
            let element_dom = document.createElement(element[i]);
            document.querySelector('.text_article').appendChild(element_dom);
            element_dom.innerText = element_text;
            text = text.replace(tag, '');
            text = text.replace(end_tag, '')
            text_dom.innerHTML = text
            render_text();
        }
    }
    
}
*/

function text_wrapping (wrapped_class, render_class) {

    let wrapped_text = document.getElementsByClassName(wrapped_class)[0].value;
    let render_area = document.getElementsByClassName(render_class)[0];

    render_area.textContent = wrapped_text;
}

function render_text (text_class) {

    let text_dom = document.getElementsByClassName(text_class)[0]; 
    let text = text_dom.textContent;

    if (text.includes('[') || text.includes(']') ) {
        text = text.replaceAll('[', '<');
        text = text.replaceAll(']', '>');
        text_dom.innerHTML = text;
    }
}

let upload_btn = document.getElementById('id_article_image');
window.onload = function main_page_load() {
    
    let iframe_upload = document.getElementById('article_image_upload').contentWindow
    upload_btn.addEventListener('change', upload_image)
   
    function upload_image() {
        document.getElementById('btn-upload').click()
    }
}

function getCursorPosition(parent) {
    let selection = document.getSelection()
    let range = new Range
    range.setStart(parent, 0)
    range.setEnd(selection.anchorNode, selection.anchorOffset)
    return range.toString().length
}
  
function setCursorPosition(parent, position) {
    let child = parent.firstChild
    while(position > 0) {
      let length = child.textContent.length
      if(position > length) {
        position -= length
        child = child.nextSibling
      }
      else {
        if(child.nodeType == 3) return document.getSelection().collapse(child, position)
            let iframe_upload = document.getElementById('article_image_upload').contentWindow
            let link = iframe_upload.document.querySelector('.article-image')
            let img_in_editor = document.createElement('img');
            img_in_editor.setAttribute('src', link.src);
            child.appendChild(img_in_editor)
            child = child.firstChild
      }
    }
}

let cursor_position = 0
function assigning_val_to_var () {

    cursor_position = getCursorPosition(document.querySelector('.jodit-wysiwyg'))
}    

document.querySelector('.jodit-wysiwyg').addEventListener('keydown', assigning_val_to_var)
document.querySelector('.jodit-wysiwyg').addEventListener('keyup', assigning_val_to_var)
document.querySelector('.jodit-wysiwyg').addEventListener('click', assigning_val_to_var)

function img_add(){
    
    setCursorPosition(document.querySelector('.jodit-wysiwyg'), cursor_position)
                                
} 
