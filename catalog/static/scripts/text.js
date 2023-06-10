/*
let btn = document.querySelector('.textStrong');

btn.addEventListener('click', text_strong)
function text_strong () {
    let accentuated_text = document.getElementById('id_text_article');
    let selected = accentuated_text.value.substring(
        accentuated_text.selectionStart, accentuated_text.selectionEnd);
    let selected_obj = '<strong>' + selected + '</strong>';
    accentuated_text.value = accentuated_text.value.replace(selected, selected_obj);
    return selected_obj;
}
*/

function clear_danger_elements(text_area, redactor) {
    
    let editor = document.getElementsByClassName(redactor)[0];
    let text_area_field = document.getElementsByClassName(text_area)[0];
    console.log(text_area_field)
    
    editor.addEventListener('change', () => {editing (text_area_field)} );
    editor.addEventListener('keyUp', () => {editing (text_area_field)} );
    editor.addEventListener('keyDown', () => {editing (text_area_field)} );
    editor.addEventListener('click', () => {editing (text_area_field)} );

    text_area_field.addEventListener('change', () => {editing (text_area_field)} );
    text_area_field.addEventListener('keyUp', () => {editing (text_area_field)} );
    text_area_field.addEventListener('keyDown', () => {editing (text_area_field)} );
    text_area_field.addEventListener('click', () => {editing (text_area_field)} );
}

function editing (text_area) {

    let danger_elements = new Array(
                        /[\[<]script[\D\W\S]*[\]>]/,
                        /[\[<]iframe[\D\W\S]*[\]>]/,
                        /href="javascript[\D\W\S]*[\]>]/,
                        /src="javascript[\D\W\S]*[\]>]/,
                        /onerror=[\D\W\S]*[\]>]/
                        )

    for (let i=0; i < danger_elements.length; i++) {

        let check = text_area.value.match(danger_elements[i])

        if (check !== null) {
            text_area.value = text_area.value.replaceAll(check, '');
        }

        if (text_area.value.includes('<') || text_area.value.includes('>') ) {
            text_area.value = text_area.value.replaceAll('<', '[');
            text_area.value = text_area.value.replaceAll('>', ']');
        }
    }
}