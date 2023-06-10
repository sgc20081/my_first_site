$(function() {
    let btn_quotes_list = $('.quote');

    for (let i=0; i<btn_quotes_list.length; i++) {
        let id_attr = btn_quotes_list[i].id;
        let id = id_attr.slice(id_attr.lastIndexOf('_')+1, id_attr.length);
        btn_quotes_list[i].addEventListener('click', () => quote_message(id));
    }
    
    let btn_delete_msg = $('.delete');

    for (let i=0; i<btn_delete_msg.length; i++) {
        let id_attr = btn_delete_msg[i].id;
        let id = id_attr.slice(id_attr.lastIndexOf('_')+1, id_attr.length);
        btn_delete_msg[i].addEventListener('click', () => confirm_delete_message(id))
        
    }

    get_msg_container_height();
    messages_visual_separation();
});

function quote_message(id) {
    let message_text = $('#forum_message_main_'+id+' .forum_message_text .text p:not(.forum_author_quote, .forum_quote)').text()
    let message_author = $('#forum_message_main_'+id+' .forum_author_profile .forum_author_message').text()
    let page = new URLSearchParams(window.location.search).get('page')
    let quote = $('<div class="forum_quote_content parent_msg" contenteditable="false">'
                +'<button><a href="?page='+page+'#forum_message_main_'+id+'">Перейти к сообщению</a></button>'
                +'<p class="forum_author_quote">'+message_author+'</p>'
                +'<p class="forum_quote">'+message_text+'</p>'
                +'</div>'
                +'<br>')
    
    $('.jodit-wysiwyg').append(quote)

    window.location.href = '#id_message_field'
}

function confirm_delete_message(id) {

    $('#'+id).css('display', 'block')
    document.addEventListener('click', listener = function () {close_popup(id, event)})

    if ($(window).width() < 1000) {
        console.log('Попашка открылась для мобильного')
        // Выполняется условие отображение попапа для мобильного
        //$('#'+id).css('top', $(window).scrollTop() + ($(window).height()/4) - ($('#'+id).outerHeight()/2))
        $('#'+id).css('top', $('#delete_btn_'+id).offset()['top'] - $('#'+id).height())
        $('#'+id).css('left',  ($(window).width()/2) - ($('#'+id).outerWidth()/2))
    }
    else {

        // Выполняется условие отображение попапа для десктопа
        $('#'+id).css('top', $('#delete_btn_'+id).offset()['top']) 
        $('#'+id).css('left',  $('#delete_btn_'+id).offset()['left'] - $('#'+id).css('width').replace('px', ''))
    }
    

}

let listener = function () {close_popup(id, event)}

function close_popup(id, event) {

    let elem = $('#'+id)[0]
    let btn = $('#delete_btn_'+id)[0]
    if (event.target === elem || elem.contains(event.target)
        || event.target === btn || btn.contains(event.target)) {
        return
    }
    $('#'+id).css('display', 'none')
    $('#'+id).offset({top: 0, left: 0})
   
    document.removeEventListener('click', listener)
}

function messages_visual_separation() {

    let ticker = 0
    let comments = $('.forum_message_container')

    $.each(comments, function(ind, comm){
        if (ind % 2 == 0){
            $(comm).addClass('first_msg')
        }
        else{
            $(comm).addClass('second_msg')
        }
    })
}

function get_msg_container_height() {

    console.log('Функция установки ширины запущена')

    let msgs = $('.forum_message_container')
    let msgs_profile_blocks = $('.forum_message_container .forum_author_profile')

    $.each(msgs_profile_blocks, function(ind, profile) {
        console.log('Профиль: ', profile)
        $(profile).css('height', $(msgs[ind]).height())

        console.log('Ширина для ', profile, ' задана')
    })
}