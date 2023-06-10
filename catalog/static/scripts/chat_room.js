// Событие на загрузку страницы (JQuery)
$(function () {

    chat_option()

})

function close_conections(){

    if (typeof window.websocket_chat_connection === 'undefined' && typeof window.websocket_online_connection === 'undefined'){
        console.log('Назначаю переменные')
        let websocket_chat_connection
        let websocket_online_connection
    }
    else {
        // Проверка, есть ли открытые websocket соединения, которые остались после перехода с прошлой страницы
        // и закрытие их, если такие есть
        console.log('ЗАКРЫВАЮ СОЕДИНЕНИЯ WEBSOCKET')
        websocket_chat_connection.close()
        websocket_online_connection.close()
    
    }
}

function chat_option(){

    close_conections()

    // Эти переменные относятся к функции подгрузки новых сообщений с сервера во время скролла
    let chat_windows = $('.chat-log')
    let last_read_msg_id = $('#last_read_msg').text()
    let last_read_msg = $('#chat_msg_'+last_read_msg_id)
    let first_room_msg_id = $('.first_room_msg').text()
    let send_server_top_last_msg_id = ''
    let last_msg_view_chat_window

    let msg_input = $('#chat-message-input')
    let send_btn = $('#chat-message-submit')
    let send_btn_label = $('.chat-message-submit-lable')

    msg_input.on('keydown', msg_input_state)
    msg_input.on('keyup', msg_input_state)
    
    function msg_input_state (){
        
        if (msg_input.val() != ''){

            send_btn.prop('disabled', false)
            send_btn_label.removeClass('disabled')
            send_btn_label.addClass('enabled')
        }
        else {
            
            send_btn.prop('disabled', true)
            send_btn_label.removeClass('enabled')
            send_btn_label.addClass('disabled')
        }
    }

    if (sessionStorage.getItem('last_read_msg') != 'null' && sessionStorage.getItem('last_read_msg') != '' && sessionStorage.getItem('last_read_msg') != null){
        $('#chat_msg_'+sessionStorage.getItem('last_read_msg'))[0].scrollIntoView()
    }
    else if(last_read_msg.length != 0){
        last_read_msg[0].scrollIntoView()
    }
    else{
        last_msg_view_chat_window = true
    }

    // Получение даты в формате дд.мм.гггг  чч:мм
    let publishTime;

    function updateTime() {

        var dateNow = new Date();

        function formatDate(date) {

            let dd = date.getDate();
            if (dd < 10) dd = '0' + dd;

            let mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;

            let yy = date.getFullYear();

            let hh = date.getHours()
            hh < 10 ? hh = '0' + hh : hh;

            let mn = date.getMinutes()
            mn < 10 ? mn = '0' + mn : mn;

            return dd + '.' + mm + '.20' + yy + ' ' + hh + ':' + mn;
        }

        publishTime = formatDate(dateNow);
    }

    // Вызов функции, котора я повторяет функцию получения времени
    // для того, чтобы постоянно получать текущее время
    window.setInterval(updateTime, 1000);

    // Получение "Название комнаты", имени и фото профиля пользователя

    let roomName = JSON.parse(document.getElementById('room-name').textContent);
  
    const authorMessage = JSON.parse(document.getElementById('author_message').textContent);
    const authorProfilePhoto = document.getElementById('profile_photo_for_chat').src;

    // Открытие нового WebSocket соединения, отвечающего за пересылку сообщений
    const chatSocket = new WebSocket(
        'wss://'
        + window.location.host
        + '/ws/catalog/chat/'
        + roomName
        + '/'
    );

    websocket_chat_connection = chatSocket

    chatSocket.onopen = function(){
        console.log('WebSocket connection is opened')
        sessionStorage.setItem('ws_connection_'+roomName, 'open')
    }

    // Событие получения сообщения из группы, где параметр e - это event 
    // - данные, присланные сервером
    chatSocket.onmessage = function(e) {
        
        const data = JSON.parse(e.data);
        let new_msg = $('<div id="chat_msg_'+data.id+'" class="chat_msg"></div>')
        let chat_text_container = $('<div class="chat_text_container"></div>')
        
        if (data.author != authorMessage) {

            let msg_author

            if (data.authorPhoto != window.location.origin+'/static/images/design/login_icon.svg') {
                
                msg_author_photo = $('<div class="chat_author_profile_photo">'
                                                + '<a href="/catalog/profile/'+data.author+'">'
                                                + '<div class="profile_photo_container">'
                                                + '<img class = "sideBarProfilePhoto" src="'+data.authorPhoto+'"> '
                                                + '</div>'
                                                + '</div>'
                                                )
            }
            else {
                msg_author_photo = $('<div class="chat_author_profile_photo">'
                                + '<a href="/catalog/profile/'+data.author+'">'
                                + '<div class="profile_photo_container_default">'
                                + '<img class = "sideBarProfilePhoto" src="'+data.authorPhoto+'"> '
                                + '</div>'
                                + '</div>'
                                )
            }
            
            new_msg.append(msg_author_photo)

            let msg_author_container = $('<div class="chat_msg_autor_container">'
                            + '<a href="/catalog/profile/'+data.author+'">'
                            + '<p>'+data.author+'</p>'
                            + '</a></div>')

            chat_text_container.append(msg_author_container)
        }
        else {
            chat_text_container.addClass('this_user_message')         
        }

        let text_msg = $('<p>'+data.message+'</p>')
        let publish_time = $('<div class="chat_msg_publish_time"><p>'+publishTime+'</p></div>')

        chat_text_container.append(text_msg)
        chat_text_container.append(publish_time)

        new_msg.append(chat_text_container)
        
        // Сообщение будет выводится в лог чата, только если с сервера подгрузились все непрочитанные сообщения
        $('.chat-log').append(new_msg)
        if (last_msg_view_chat_window){
            new_msg[0].scrollIntoView()
            sessionStorage.setItem('read_msg_room', roomName)
            sessionStorage.setItem('last_read_msg', data.id)
        }
        else{
            unread_msg = $('<p class="unread_chat_msg" id="unread_chat_msg_'+data.id+'">'+data.id+'</p>')
            $('.unread_msgs_array').append(unread_msg)

            $('.unread_msgs_count.'+roomName).text( parseInt($('.unread_msgs_count.'+roomName).text()) + 1 )
        }

        if (typeof get_btn_popup_offset === 'function'){
            get_btn_popup_offset()
        }
        else{
            console.error('Функция выстраивания позиции popup окна чата не обнаружена')
        }
        
        url = '/catalog/chat/'+roomName+'/'
    };

    // Событие происходящее при закрытии соединения WebSocket
    chatSocket.onclose = function() {
        console.error('Chat socket closed unexpectedly');
        sessionStorage.setItem('ws_connection_'+roomName, 'close')
    }

    // Ставит фокус на поле ввода сообщения
    document.querySelector('#chat-message-input').focus();
    // Определяет, что при нажатии клавиши Enter происходит клик на
    // кнопку submit
    document.querySelector('#chat-message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {  // enter, return
            document.querySelector('#chat-message-submit').click();
        }
    };

    // После нажатия на кнопку submit собирает данные: текст сообщения, автор
    // и время публикации, собирает в JSON формат и отправляет в WebSocket
    document.querySelector('#chat-message-submit').onclick = function(e) {
        const messageInputDom = document.querySelector('#chat-message-input');
        const message = messageInputDom.value;

        chatSocket.send(JSON.stringify({
            'message': message,
            'author': authorMessage,
            'authorPhoto': authorProfilePhoto,
            'publishTime': publishTime,
        }));
        messageInputDom.value = '';

        send_btn.prop('disabled', true)
        send_btn_label.removeClass('enabled')
        send_btn_label.addClass('disabled')
    };

    var user_list = $('.user_list');

    leave_chat_room_btn_option(roomName) // Запуск функции, отвечающей за выход пользователя из комнаты

    // Открывает соединение WebSocket, отвечающее за список онлайн пользователей
    const socket = new WebSocket(
        'wss://'
                + window.location.host
                + '/ws/catalog/chat/'
                + roomName
                + '/online/'
            );

    websocket_online_connection = socket

    socket.onopen = function(){
        console.log('WebSocket connection is opened')
        
    }

    socket.onmessage = function(event) {

        sessionStorage.setItem('online_users_in_room', event.data)

        const data = JSON.parse(event.data)

        $('.user_list').html('')
        for (let i=0; i<data.online_users_list.length; i++) {
            let user = JSON.parse(data.online_users_list[i])[0].fields
            $('.user_list').html(
                $('.user_list').html()
                + '<a href="/catalog/profile/'+ user.username +'"><p>'
                + '<img  class = "sideBarProfilePhoto" src="/'+user.profile_photo_circle+'" alt="">'
                + user.username
                + '</a></p>')
        }

        if (typeof chat_popup_open_chat_window === 'function'){

            get_btn_popup_offset();
        }
    }

    socket.onclose = function() {
        console.log('WebSocket connection is closed')
    }

    socket.onerror = function(event) {
        console.log(event)
        console.log("Something went wrong. Connetcion is closed")
    }


    // Этот раздел с функцией предназначен для защиты от излишнего колличества отпрваляемых на сервер
    // запросов. Этот раздел позволяет отправлять запрос от функции get_extra_msgs() не чаще, чем раз в 1 сек.
    let timer_flag_send_to_server = true
    let server_read_msgs_data_recieve_flag;
    
    function timer_check(){

        if(server_read_msgs_data_recieve_flag) {

            timer_flag_send_to_server = true
            setTimeout(timer_check, 1000)
        }
        else {
            setTimeout(timer_check, 1000)
        }
    }
    
    let chat_window = chat_windows
    
    chat_window.scroll(get_extra_msgs)
    
    timer_check()

    let chat_window_top = chat_window.offset().top
    let chat_window_bot = chat_window_top + chat_window.height()
    
    // Назначает на каждое не прочитанное сообщении событие scroll отвечающие за отслеживание прочтения сообщения
    // и удаления его из списка непрочитанных сообщений, после прочтения
    $(chat_window).on('scroll', function(){
        
        unread_msgs = $('.unread_chat_msg')
        
        chat_window_top = chat_window.offset().top
        chat_window_bot = chat_window_top + chat_window.height()
            
        $.each(unread_msgs, function (index, msg) {

                let msg_id = msg.textContent
                let target = $('#chat_msg_'+msg_id)
                let target_offset = target.offset().top

                    if (target_offset < chat_window_bot){
                        
                        sessionStorage.setItem('read_msg_room', roomName)
                        sessionStorage.setItem('last_read_msg', msg_id)
                        
                        $(target).off('scroll.msg_'+msg_id)
                        
                        msg.remove()

                        // Уменьшает счётчик не прочитанных сообщений в уведомлениях на 1
                        // Функция, которая увеличивает счётчик на 1 при принятии нового сообщения, находится в chat_notifiactions.js
                        if($('.'+roomName).length){
                            let count = $('.'+roomName).text()
                            if (count > 0){
                                $('.'+roomName).text(parseInt(count) - 1)
                            }
                        }

                        if (popup_count.length != 0){
                            popup_count.text(parseInt(popup_count.text()) + 1)
                        }
                    }
        })
    })
    
    // Подгрузка, при скролле окна чата вверх, дополнительных прочитанных сообщений чата с сервера
    function get_extra_msgs(){

        //console.log('В экстра-месседжах: ', server_read_msgs_data_recieve_flag)

        if (timer_flag_send_to_server == false){
            return
        }

        chat_window_top = chat_window.offset().top
        chat_window_bot = chat_window_top + chat_window.height()

        let last_view_read_msg = $('#'+$('.chat_msg')[5].id)
        let last_msg_in_array = $('.chat_msg').slice(-3)[2]
        last_msg_in_array_id = last_msg_in_array.id.slice(last_msg_in_array.id.lastIndexOf('_')+1)

        let send_server_top_last_msg = $('#'+$('.chat_msg')[0].id)
        let send_server_bot_last_msg = $('#'+$('.chat_msg').slice(-1)[0].id)
        send_server_top_last_msg_id = send_server_top_last_msg.attr('id').slice(send_server_top_last_msg.attr('id').lastIndexOf('_')+1)
        send_server_bot_last_msg_id = send_server_bot_last_msg.attr('id').slice(send_server_bot_last_msg.attr('id').lastIndexOf('_')+1)

        let elem_up = last_view_read_msg
        let elem_up_top = elem_up.offset().top
        let elem_up_id = elem_up.attr('id').slice(elem_up.attr('id').lastIndexOf('_')+1)
        
        let elem_down = send_server_bot_last_msg
        let elem_down_top = elem_down.offset().top
        
        if (elem_down_top < chat_window_bot){
            last_msg_view_chat_window = true
        }
        else{
            last_msg_view_chat_window = false
        }
        
        // Следующий блок отвечает за подгрузку дополнительных сообщений из истории чата при скролле окна чата вверх
        if(elem_up_top > chat_window_top && send_server_top_last_msg_id != first_room_msg_id && timer_flag_send_to_server){
            
            timer_flag_send_to_server = false

            let loading_msg_animation = (new HTMLElements).loading
            $('.chat-log').prepend(loading_msg_animation)

            server_read_msgs_data_recieve_flag = false;

            $.ajax({
                url: '/catalog/chat/'+roomName+'/?load_extra_msg=top&last_msg_id='+send_server_top_last_msg_id,
                method: 'get',
                dataType: 'json',
                success: function(data){
                    $.each(data.chat.reverse(), function(ind, value){
                        let message = JSON.parse(value.message)[0].fields
                        let author = JSON.parse(value.author)
                        let msg_conteiner = $('<div class="chat_msg"></div>')
                        let chat_text_container = $('<div class="chat_text_container"></div>')

                        if (author[0].fields.username == authorMessage) {
                            chat_text_container.addClass('this_user_message')
                        }
                        
                        $('.chat-log').prepend(msg_conteiner)
                        msg_conteiner.attr('id', 'chat_msg_'+JSON.parse(value.message)[0].pk)
                        
                        if (author[0].fields.username != authorMessage) {

                            let msg_author_photo

                            if (author[0].fields.profile_photo_circle != 'static/images/design/login_icon.svg') {
                                
                                msg_author_photo = $('<div class="chat_author_profile_photo">'
                                                + '<a href="/catalog/profile/'+author[0].fields.username+'">'
                                                + '<div class="profile_photo_container">'
                                                + '<img class = "sideBarProfilePhoto" src="/catalog/'+author[0].fields.profile_photo_circle+'"> '
                                                + '</div>'
                                                + '</div>'
                                                )
                            }
                            else {
                                msg_author_photo = $('<div class="chat_author_profile_photo">'
                                                + '<a href="/catalog/profile/'+author[0].fields.username+'">'
                                                + '<div class="profile_photo_container_default">'
                                                + '<img class = "sideBarProfilePhoto" src="/catalog/'+author[0].fields.profile_photo_circle+'"> '
                                                + '</div>'
                                                + '</div>'
                                                )
                            }
                            
                            msg_conteiner.append(msg_author_photo)

                            let msg_author_container = $('<div class="chat_msg_autor_container">'
                                            + '<a href="/catalog/profile/'+author[0].fields.username+'">'
                                            + '<p>'+author[0].fields.username+'</p>'
                                            + '</a></div>')

                            chat_text_container.append(msg_author_container)

                        }

                        
                        let msg_text = $('<p>'+message.message+'</p>')
                        let publish_time = $('<div class="chat_msg_publish_time"><p>'+message.publish_time+'</p></div>')
                                                
                        chat_text_container.append(msg_text)
                        chat_text_container.append(publish_time)

                        msg_conteiner.append(chat_text_container)
                    })

                    chat_windows.scrollTop(loading_msg_animation.offset().top - chat_window.offset().top + parseInt(last_view_read_msg.css('margin-bottom')))
                    loading_msg_animation.remove()

                    server_read_msgs_data_recieve_flag = true;                    
                }
            })
        }
    }
}


// Блок кода, который отвечает за выход пользователя из комнаты
function leave_chat_room_btn_option(room_name) {

    let leave_chat_btn = $('.leave_chat_room_btn')

    let leave_chat_room_listener = function(){leave_chat_room(room_name)}
    leave_chat_btn.off('click').on('click', leave_chat_room_listener)
}

function leave_chat_room(room_name) {

    $.ajax({
        url: '/catalog/chat/'+room_name+'/leave_chat_room/',
        method: 'get',
        dataType: 'html',
        success: function(data){

            $.each($('.users_chats .chat_room_popup'), function(ind, chat){
                if (chat.textContent == room_name){
                    chat.remove()
                }
            })

            if (window.location.href == window.location.origin+'/catalog/chat/'+room_name+'/') {
                window.location.href = window.location.origin+'/catalog/chat'
            }
            else {
                if (typeof chat_popup_open === 'function') {
                    chat_popup_open()
                }
                else{
                    console.error('Функция открытия окна попапа чата не была обнуружена')
                }
            }
        }
    })
}