// Код, отвечающий за отправку информации о прочитанных в реальном времени 
// (то есть, находясь в чате, когда пришло новое сообщение), находится в файле chat_notification.js.
// Информация отправляется из данных сессии раз в 30 сек., куда в свою очередь попадает при срабатывании
// события при получении нового сообщения от websocket

$(function () {

    //read_msg_send()
    
})

function read_msg_send(){

    let chat_room = ''
    // Проверка на то, поступает ли название комнаты из JSON ответа или нет
    console.log(document.getElementById('room-name').textContent)
    if (document.getElementById('room-name').textContent.indexOf('"') != -1) {
        chat_room = JSON.parse(document.getElementById('room-name').textContent);
        console.log('Это комната', chat_room)
    }
    else {
        chat_room = document.getElementById('room-name').textContent
        console.log('Это комната', chat_room)
    }
        
    sessionStorage.setItem('chat_room', chat_room)

    $(document).ready(function(){
        
        // Скролл до последнего прочитанного сообщения, сразу после загруки страницы (если такое есть)
        if ($('.last_read_msg').text() != 'null'){
            $('#chat_msg_'+$('.last_read_msg').text())[0].scrollIntoView()
        }

        // Таймер, при истичении времени отправляет данные о прочитанных сообщениях на сервер
        // либо запускается снова, если было прочитано еще одно сообщение
        /*
        let stop_timer = ''
        let timer_working = false
        function delay_timer(second, time_out) {
        
            let sec = second
            timer_working = true

            // Если время вышло и массив с прочитанными сообщениями не пуст, 
            // информация о прочитанных сообщениях, уходит на сервер
            if (sec == time_out && unread_msgs_str != []) {
                let xml = new XMLHttpRequest();
                url = '/catalog/chat/'+chat_room+'/'
                xml.open('GET', url+'?msg='+unread_msgs_str, true)
                xml.send()
                sessionStorage.setItem('read_msg', '');
                timer_working = false
            }
            // Если время вышло, а массив пуст, таймер не перезапускается
            else if (sec == time_out && unread_msgs_str == [] ){
                timer_working = false
                return
            }
            else {
                sec +=1
                console.log(sec)
                if (stop_timer == 'stop'){
                    stop_timer = ''
                    delay_timer(0, time_out)
                }
                else{
                    setTimeout(delay_timer, 1000, sec, time_out)
                }
            }
        }

        let unread_msgs_str = ''

        delay_timer(0, 30)
        */
        let flag_to_prepare_to_send_read_msg = false
        function prepare_to_send_read_msg(event){

            event.stopPropagation()

            if (flag_to_prepare_to_send_read_msg){
                return
            }
            flag_to_prepare_to_send_read_msg = true

            unread_msgs = $('.unread_chat_msg')
            $.each(unread_msgs, function (index, msg_js) {
                let unread_msg_id = msg_js.textContent
                let target = $('#chat_msg_'+unread_msg_id)

                // Проверяем, загрузилось ли не прочитанное сообщение с сервера, если уже прогрузилось
                // то выполняем код, если нет, то фунцкия прекращает работу и ожидает, пока элемент догрузится
                // Также проводится проверка на внесён ли id непрочитанного сообщения в сессионную информацию о прочитанных сообщениях
                // Делается эта проверка для предотвращения бесконечной активации события при появлении сообщения на экране и бесконечной
                // отправки данных на сервер
                if (target.length){    
                    let targetPos = target.offset().top;
                    let chat_logHeight = $('.chat-log').height();
                    let scrollToElem = targetPos - chat_logHeight;
                    $('.chat-log').on('scroll.unread_chat_msg_'+unread_msg_id, function(){
                        let chat_logScrollTop = $(this).scrollTop();
                        if(chat_logScrollTop > scrollToElem){
                            if (sessionStorage.getItem('read_msg').indexOf(unread_msg_id) == -1) {
                                //unread_msgs_str += unread_msg_id+','

                                sessionStorage.setItem('chat_room', chat_room)

                                if (sessionStorage.getItem('read_msg') == '' || sessionStorage.getItem('read_msg') == null){
                                    sessionStorage.setItem('read_msg', unread_msg_id+',')
                                }
                                else{
                                    sessionStorage.setItem('read_msg', 
                                        sessionStorage.getItem('read_msg')
                                        + unread_msg_id+',')
                                }
                                    
                                //stop_timer = 'stop'
                                //if (timer_working == false) {delay_timer(0, 30)}

                                msg_js.remove()
                                $(window).off('scroll.unread_chat_msg_'+unread_msg_id)
                            }
                        }
                    });
                }
            })
            flag_to_prepare_to_send_read_msg = false
        }
        $('.chat-log').on('scroll', ()=>{prepare_to_send_read_msg(event)})
    })
}