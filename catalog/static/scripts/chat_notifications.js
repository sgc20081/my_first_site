// Событие на загрузку страницы (JQuery)
$(function () {

    console.log('Запустился код отвечающий за нотификации чата')

    if (sessionStorage.getItem('last_read_msg') != '' && sessionStorage.getItem('last_read_msg') != 'null' && sessionStorage.getItem('last_read_msg') != null){
        
        room_name = sessionStorage.getItem('read_msg_room')
        console.log('Условие пройдено. Информация о последнем прочитаном сообщении еесть в сессии')
        send_read_msg_to_server(room_name)
    }

    $.ajax({
        url: '/catalog/notifications',
        method: 'get',
        dataType: 'json',
        context: $('.users_chats'),
        success: function(data){

            let chats_info = JSON.parse(data.chats)

            $.each(chats_info, function (ind, chat){

                $('.users_chats').html($('.users_chats').html()
                    + '<div class="chat_room_name_container '+ chat.chat_room +'_container">'
                    + '<div class="chat_room_popup">'
                    + '<span>' + chat.chat_room + '</span>'
                    + '</div>'
                    + '<div class="popup_unread_msgs_count">' + chat.unread_msgs_count + '</div>'
                    + '</div>')

                $('.unread_msgs').html(
                    $('.unread_msgs').html()
                    +'<p>У вас '
                    +'<span class="unread_msgs_count '+chat.chat_room+'">'
                    +chat.unread_msgs_count
                    +'</span>'
                    +' непрочитанных сообщений в '
                    +'<a href="/catalog/chat/'
                    +chat.chat_room+'/">'
                    +chat.chat_room
                    +'</a></p>')
        
                // Установка соединения websocket с каждым из чатов, в котором состоит пользователь
                let room_name = chat.chat_room

                console.log('Устанавливается соединене с комнатой: ', room_name)
                let socket = new WebSocket(
                    'wss://'
                    + window.location.host
                    + '/ws/catalog/chat/'
                    + room_name
                    + '/'
                );
                
                socket.onopen = function(){
                    sessionStorage.setItem('ws_connection_'+room_name, 'open')
                }
                
                // При получении сообщения из чата счётчик непрочитанных 
                // сообщений увеличивается, если пользователь не находится на странице чата
                socket.onmessage = function(event) {

                    // Счётчик будет прибавлятся, только если: текущая ссылка это не сслыка текущего чата,
                    // если не открыт поп-апп чата, в котором не открыто окно текущего чата
                    if (window.location.href != window.location.origin+'/catalog/chat/'+room_name+'/'){

                        if ($('.popup_chat_open').attr('id') != room_name){

                            if($('.'+room_name).length != 0){
                                
                                let count = $('.'+room_name).text()
                                $('.'+room_name).text(parseInt(count) + 1)

                                if ($('.'+ room_name +'_container .popup_unread_msgs_count').length != 0){
                                    console.log($('.chat_popup_room_list .'+ room_name +'_container .popup_unread_msgs_count').text())
                                    console.log($('.chat_popup_room_list .'+ room_name +'_container .popup_unread_msgs_count').text())
                                    $('.chat_popup_room_list .'+ room_name +'_container .popup_unread_msgs_count').text(
                                        parseInt($('.chat_popup_room_list .'+ room_name +'_container .popup_unread_msgs_count').text()) + 1)
                                }
                            }
                            else{
                                $('.unread_msgs').append('<p>У вас '
                                    +'<span class="unread_msgs_count '+room_name+'">'
                                    + 1
                                    +'</span>'
                                    +' непрочитанных сообщений в '
                                    +'<a href="/catalog/chat/'
                                    +room_name+'/">'
                                    +room_name
                                    +'</a></p>'
                                    +'\n')
                            }
                        }
                    }
                }
        
                socket.close = function(){
                    sessionStorage.setItem('ws_connection_'+room_name, 'close')
                }
            });
        }
    });
})

// Отправка информации о прочитанных в реальном времени (то есть, находясь в чате, когда пришло новое сообщение) 
// сообщений на сервер раз в 30 сек.
function send_read_msg_to_server(room) {

    console.log('Инфорция об последнем прочитаном сообщении: ', sessionStorage.getItem('last_read_msg'), ' комнаты: ', room, ' отправлено на сервер')

    if (sessionStorage.getItem('last_read_msg') != '' && sessionStorage.getItem('last_read_msg') != 'null' && sessionStorage.getItem('last_read_msg') != null){
        
        url = '/catalog/chat/'+room+'/'+'?last_read_msg='+sessionStorage.getItem('last_read_msg'),

        sessionStorage.setItem('last_read_msg', '');
        sessionStorage.setItem('read_msg_room', '');

        $.ajax({
            url: url,
            method: 'get',
            dataType: 'json',
            context: $('.users_chats'),
            success: function(data){
                
                if ($('#last_read_msg').length != 0){
                    
                    $('#last_read_msg').text(data.last_read_msg)
                }
            }
        })
    }
    setTimeout(send_read_msg_to_server, 30000, room)
}