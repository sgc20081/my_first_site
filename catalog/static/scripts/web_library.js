function inputChildElement(parent, element, position) {

    let non_binary_tag = new Array(
        'area',
        'base',
        'br',
        'col',
        'embed',
        'hr',
        'img',   
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr'
    )
    
    // СБОРКА ДОЧЕРНИХ ЭЛЕМЕНТОВ УЖЕ ПРИСУТСВУЮЩИХ В РОДИТЕЛЬСКОМ ЭЛЕМЕНТЕ

    let text_in_parent = parent.innerHTML
    let doms = new Array();
    let check = ''
    
    while (text_in_parent.indexOf('<') != -1){
        let open = text_in_parent.indexOf('<') // индекс начала первого HTML элемента
        let close = text_in_parent.indexOf('>')+1 // индекса конца первого HTML элемента
        
        // Запуск проверки на сравнение первого элемента с массивом небинарных элементов
        for (let i=0; i<non_binary_tag.length; i++){
            
            if (text_in_parent.slice(open, close).indexOf(non_binary_tag[i]) != -1) { 
                // Элемент не бинарный (есть в списке)
                open = text_in_parent.indexOf('<')
                close = text_in_parent.indexOf('>')+1
                let dom_and_position = new Array()
                dom_and_position.push(text_in_parent.slice(open, close), open)
                doms.push(dom_and_position)
                text_in_parent = text_in_parent.slice(0, open) + text_in_parent.slice(close, text_in_parent.length) // Удаление первого дочернего элемента
                check = true
            }  
        }
        if (check == false){
            // Если элемент не найден в массиве небинарных элементов,
            // check возвращает false и идёт работу с бинарным элементом
            open = text_in_parent.indexOf('<')
            close = text_in_parent.indexOf('>', text_in_parent.indexOf('>')+1)+1
            let dom_and_position = new Array()
            dom_and_position.push(text_in_parent.slice(open, close), open)
            doms.push(dom_and_position)
            text_in_parent = text_in_parent.slice(0, open) + text_in_parent.slice(close, text_in_parent.length)
        }
    }

    parent.innerHTML = text_in_parent // Запись результата в виде HTML в родительский элемент (уже без дочерних элементов)

    // ПРЕОБРАЗОВАНИЕ ВСТАВЛЯЕМОГО ЭЛЕМЕНТА В СТРОКУ

    let tag = element.tagName.toLowerCase()
    
    let html_code = ''
    let all_attributes = ''
    let attributes = element.getAttributeNames()
    for (let i=0; i<attributes.length; i++) {
        all_attributes += " " + attributes[i] + '="' + element.getAttribute(attributes[i]) + '"'
    }

    for (let i=0; i<non_binary_tag.length; i++) {
        if (non_binary_tag[i] == tag) {
            html_code = '<' + tag + all_attributes + '>' + element.textContent
        }
        else {
            html_code = '<' + tag + all_attributes + '>' + element.textContent + '</' + tag + '>'
        }
    }

    let html_part1 = parent.innerHTML.slice(0, position);
    let html_part2 = parent.innerHTML.slice(position, parent.textContent.lenght)
    let text_part1 = parent.textContent.slice(0, position);
    let text_part2 = parent.textContent.slice(position, parent.textContent);

    for (let i=0; i<doms.length; i++) {
        let [elem, posit] = doms[i]

        if (posit < position && i == 0) {
            html_part1 = html_part1.slice(0, posit) 
                        + elem 
                        + html_part1.slice(posit, html_part1.length);
        }
        else if (posit < position && i != 0) {
            [elem_last, posit_last] = doms[(i-1)]
            html_part1 = html_part1.slice(0, posit+elem_last.length) 
                        + elem 
                        + html_part1.slice(posit+elem_last.length, html_part1.length);
        }
        else if (posit > position && i == 0) {
            html_part1 += html_code
            html_part2 = html_part2.slice(0, posit)
                        + elem
                        + html_part2.slice(posit, html_part2.length);
        }
        else if (posit > position && i != 0) {
            [elem_last, posit_last] = doms[(i-1)]
            html_part1 = html_part2.slice(0, posit + elem_last.length) 
                        + elem 
                        + html_part2.slice(posit+elem_last.length, html_part2.length);
        }
    }

    res = html_part1 + html_part2
    parent.innerHTML = res
}

let p = document.querySelector('.p')

let span = document.createElement('span')
span.setAttribute('test', 'тестовый класс')
span.textContent = 'ТЕСТОВЫЙ КОНТЕНТ, КОТОРЫЙ ВСТАВЛЯЕТСЯ'
let img = document.createElement('img')
img.setAttribute('src', 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png')
let some_child = document.createElement('img')
some_child.setAttribute('src', 'http://jasndkjnqkehjqjbjebejwhbhjbqwjeb')

// Функция вставки подстроки внутри строки
function include_str (str, substr, position) {
    let part1 = str.slice(0, position);
    let part2 = str.slice(position, str.length);
    let result = part1 + substr + part2;
    return result
}