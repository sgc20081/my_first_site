// Событие на загрузку страницы (JQuery)
$(function () {

    popup_btn.on('click.chat_popup_open', chat_popup_open)

})

let chat_popup = $('.chat_popup');
let chat_popup_header = $('.chat_popup_header');
let chat_popup_body = $('.chat_popup_body');
let popup_btn = $('.chat_popup_btn');
let popup_window = $('.chat_popup.popup_window_chat_list.popup');
let room_list_container = $('<div class="chat_popup_room_list scroll_line"></div>')

let chat_enter_input = $('<div class="chat_popup_enter_input_container"></div>');

let chat_user_list_body = $('<div class="chat_popup_user_list_container"></div>')

let back_btn;

let popup_btn_top;
let popup_btn_left;

let users_online_list_option_listener;
let back_btn_options_listener;
let back_to_the_chat_window_btn_listener;

function get_btn_popup_offset() {

    popup_btn_top = popup_btn.offset().top
    popup_btn_left = popup_btn.offset().left

    chat_popup.css({top: 0, left: 0})

    if ($(window).outerWidth() > 1000) {
        chat_popup.offset({top: popup_btn_top - chat_popup.height() - popup_btn.height(),
            left: popup_btn_left - chat_popup.width()})
    }
    else {
        chat_popup.offset({top: 25 + $(window).scrollTop(),
            left: ($(window).width() - chat_popup.width()) / 4})
    }
}

function chat_get_chat_room_list() {

    chat_popup_body.html(chat_user_list_body)
    room_list_container.html($('.users_chats').html())

    chat_user_list_body.append(room_list_container)
    chat_user_list_body.append(chat_enter_input)

    show_hide_null_count()

    let chats_popup = $('.chat_popup_room_list .chat_room_popup span')
    
    let chat_room_name_container = $('.chat_popup_room_list .chat_room_name_container')

    $.each(chats_popup, function(ind, room_name){
        
        room_name = $(room_name)
        room_name.addClass('chat_room_name')

        room_name.off('click.').on('click.', ()=>{chat_popup_open_chat_window(room_name.text(), event)})

        let room_name_ticker = new Ticker($(room_name), $(chat_room_name_container[ind]), 8)
        console.log($(room_name), '====', chat_room_name_container[ind])
        room_name_ticker.init()
    })

    let popup_counts = $('.chat_popup_user_list_container .chat_room_name_container .popup_unread_msgs_count')
    
    $.each(popup_counts, function(ind, count){
        console.log('Вешаю слушатель события изменения DOM-а на: ', count)
        $(count).off('DOMSubtreeModified').on('DOMSubtreeModified', show_hide_null_count)
    })
}

// Попап чата открывается впервые после загрузки страницы
function chat_popup_open() {

    chat_popup_open_window_check()

    chat_popup.show()

    get_btn_popup_offset()

    popup_btn.off('click.chat_popup_open', chat_popup_open)
    popup_btn.on('click.chat_popup_hide', chat_popup_hide)

    $.ajax({
        url: '/catalog/chat',
        method: 'get',
        dataType: 'json',
        
        success: function(data){

            chat_get_chat_room_list()
            chat_enter_input.html($(data.chat).find('main *'))
        }
    })

    get_btn_popup_offset()
}

function back_btn_options(chat_title){
    
    chat_get_chat_room_list()
    get_unread_msgs_counts()
    show_hide_null_count()

    chat_title.stop()

    $('.in_chat').hide()
    $('.in_chat_list').show()

    chat_popup.removeClass('popup_window_chat_log')
    chat_popup.addClass('popup_window_chat_list')

    $('.popup_chat_open').attr('id', '')

    get_btn_popup_offset()
}

function chat_popup_hide() {
    
    chat_popup.css('display', 'none')
    popup_btn.on('click.chat_popup_open', chat_popup_show)
    popup_btn.off('click.chat_popup_hide', chat_popup_hide)
    
    chat_popup_close_window_check()
}

function chat_popup_show () {

    chat_popup_open_window_check()

    chat_popup.show()

    get_btn_popup_offset()
    
    popup_btn.off('click.chat_popup_open', chat_popup_show)
    popup_btn.on('click.chat_popup_hide', chat_popup_hide)
}

function chat_popup_open_window_check(){
    sessionStorage.setItem('popup_chat_window_status', 'open')

    $('html').css({'overscroll-behavior': 'contain'})
}

function chat_popup_close_window_check(){
    sessionStorage.setItem('popup_chat_window_status', 'close')

    $('html').css({'overscroll-behavior': ''})
}

function chat_popup_open_chat_window(room_name, event){

    // Данная строка нужна, для того, чтобы при запуске функции, останавливать всплытие события
    // то есть, для того, чтобы не срабатывал сразу же второй обработчик события, которой находится в данной ф-ции
    event.stopPropagation()
    console.log('Запустился чат вот этой комнаты', room_name)

    if (sessionStorage.getItem('last_read_msg') != 'null' && sessionStorage.getItem('last_read_msg') != '' && sessionStorage.getItem('last_read_msg') != null){
        
        send_read_msg_to_server(sessionStorage.getItem('read_msg_room')) // Данная функция находится в chat_notifications.js
    }

    $.ajax({
        url: '/catalog/chat-popup/'+room_name+'/',
        method: 'get',
        dataType: 'json',
        
        success: function(data){
            
            let chat = $(data.chat_room_html).find('.chat')
            let user_list = $(data.chat_room_html).find('.chat_options_container')

            user_list.css('display', 'none')
            chat_popup_body.append(user_list)
            chat_popup_body.html(chat)

            $('.in_chat_list').hide()
            $('.in_chat').show()

            chat_popup.removeClass('popup_window_chat_list')
            chat_popup.addClass('popup_window_chat_log')
            
            back_btn = $('.chat_popup_back_btn')

            $('.chat_title').html('<div class="chat_popup_room_name">'+room_name+'</div>')
            
            users_online_list_option_listener = function () {users_online_list_option(user_list, room_name)}
            $('.chat_title').off('click').on('click', users_online_list_option_listener)
            
            let chat_title = new TickerPermanent($('.chat_popup_room_name'), $('.chat_title'), 10)
            chat_title.init()

            get_btn_popup_offset()
            
            back_btn_options_listener = function(){back_btn_options(chat_title)}
            back_btn.off('click').on('click', back_btn_options_listener)

            $('.popup_chat_open').attr('id', room_name)
        }
    });
}

function users_online_list_option(user_list, room_name) {

    if (sessionStorage.getItem('online_users_in_room') != '') {

        user_list.show()

        back_to_the_chat_window_btn_listener = function() {back_to_the_chat_window_btn(room_name, event)}
        back_btn.off('click').on('click', back_to_the_chat_window_btn_listener)

        $('.chat_title').off('click', users_online_list_option_listener)
        $('.chat_title p').css('cursor', 'default')
        
        let data = sessionStorage.getItem('online_users_in_room')
        if (data != null) {

            let users_online = JSON.parse(data).online_users_list
 
            chat_popup_body.html(user_list)
            console.log('Юзер-лист: ', users_online)
            $.each(users_online, function(ind, user){
                console.log('Это юзер: ', user)
                user = JSON.parse(user)
                $('.user_list').html(
                    $('.user_list').html()
                    + '<a href="/catalog/profile/'+ user[0].fields.username +'"><p>'
                    + '<img  class = "sideBarProfilePhoto" src="' + user[0].fields.profile_photo_circle + '" alt="">'
                    + user[0].fields.username
                    + '</a></p>')
            })
        }
        else {
            console.error('Отсутствует подлюкчение к Websocket!')
            chat_popup_body.html(user_list)
            $('.user_list').html('<p class="errors">Отсутствует подлюкчение к Websocket!</p>')
        }
        
        get_btn_popup_offset()

        sessionStorage.setItem('online_users_in_room', '')
        sessionStorage.removeItem('online_users_in_room')
    }
    leave_chat_room_btn_option(room_name)
}

function back_to_the_chat_window_btn (room_name, event){

    back_btn.off('click', back_to_the_chat_window_btn)
    $('.chat_title p').css('cursor', 'pointer')

    chat_popup_open_chat_window(room_name, event)    
}

function get_unread_msgs_counts() {

    let basic_counts = $('.unread_msgs p .unread_msgs_count')
    let popup_counts = $('.chat_popup_user_list_container .chat_room_name_container .popup_unread_msgs_count')
    console.log(basic_counts, '===+++===', popup_counts)
    $.each(popup_counts, function(ind, count){
        $(count).text($(basic_counts[ind]).text())
    })
}

function show_hide_null_count() {

    let popup_counts = $('.chat_popup_user_list_container .chat_room_name_container .popup_unread_msgs_count')
    console.log('Контент изменился')
    $.each(popup_counts, function(ind, count){
        //console.log(count, ' : ', parseInt($(count).text()) <= 0 && $(count).css('display') != 'hidden')
        //console.log(count, ' : ', parseInt($(count).text()) >= 0 && $(count).css('display') == 'hidden')
        if (parseInt($(count).text()) <= 0 && $(count).css('display') != 'hidden') {
            $(count).hide()
        }
        else if(parseInt($(count).text()) >= 0 && $(count).css('display') == 'none') {
            $(count).show()
        }
    })
}