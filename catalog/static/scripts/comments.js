$(function() {
    
    comments_options()

});

function comment_send_ajax_event(){

    let new_comment_form = $('.new_comment_form')

    new_comment_form.on('submit', function(event){
        event.preventDefault()
        let csrf = $('.new_comment_form input[name="csrfmiddlewaretoken"]').val()
        let comm_text = $('.new_comment_form textarea').val()
        let allcomm_id = new_comment_form.attr('id').slice(new_comment_form.attr('id').lastIndexOf('_')+1)
        let comm_type = 'parent_com'
        comment_send_ajax(allcomm_id, comm_type, comm_text, csrf)
    })

    $.each($('.reply_comment_form'), function(ind, form){
        let com_form = $(form)
        com_form.on('submit', function(event){
            event.preventDefault()
            let csrf = $('.new_comment_form input[name="csrfmiddlewaretoken"]').val()
            let comm_text = $('#'+form.id+' textarea').val()
            let parent_id = com_form.attr('id').slice(com_form.attr('id').lastIndexOf('_')+1)
            let allcomm_id = com_form.attr('class').slice(com_form.attr('class').lastIndexOf('_')+1)
            let comm_type = 'child_com'
            comment_send_ajax(allcomm_id, comm_type, comm_text, csrf, parent_id)
        })
    })
}

function comment_send_ajax(comment_id, comm_type, comm_text, csrf, parent_com_id=0){

    console.log('Комменты id: ', comment_id, '|| тип комментов: ', comm_type, '|| id коммента родителя: ', parent_com_id, ' || текст комментария: ', comm_text, ' || csrf токен: ', csrf)

    if (comm_type == 'parent_com'){
        $.ajax({
            url: '/catalog/comment-new/?type=comment_new&allcomments_id='+comment_id+'&comm_text='+comm_text,
            method: 'post',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrf)
            },
            success: function(data){
                let comments = data.comments
                console.log(comments)
                $('.comments_template_container').html(comments)

                comments_options()
                likes_options()
            }
        })
    }
    else if (comm_type == 'child_com'){
        console.log('Тип коммента: ребёнок')
        $.ajax({
            url: '/catalog/comment-reply/?type=comment-reply&allcomments_id='+comment_id+'&parent_comm_id='+parent_com_id+'&comm_text='+comm_text,
            method: 'get',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrf)
            },
            success: function(data){
                let comments = data.comments
                console.log(comments)
                $('.comments_template_container').html(comments)

                comments_options()
                likes_options()
            }
        })
    }
    else{
        console.log('Неустановленный тип комментария. ID комментария: ', comment_id)
    }
}

function comments_visual_separation() {

    let ticker = 0
    let comments = $('.comment')

    $.each(comments, function(ind, comm){
        if (ind % 2 == 0){
            $(comm).addClass('first_comm')
        }
        else{
            $(comm).addClass('second_comm')
        }
    })
}

function comments_options(){

    comment_send_ajax_event()

    let btns_comm_reply = $('.comment_reply_btn')

    $.each(btns_comm_reply, function(ind, btn_js){
        let btn = $(btn_js)
        let allcomm_id = btn.attr('class').slice(btn.attr('class').lastIndexOf('_')+1)
        let par_id = btn.attr('id').slice(btn.attr('id').lastIndexOf('_')+1)

        btn.on('click.btn_'+par_id, ()=>{open_comm_form(par_id, allcomm_id)})
    })
    
    function open_comm_form(id, allcomm_id) {

        let comm_reply_form = $('#comment_reply_form_'+id)
        let send_btn = $('#comment_reply_form_'+id+' button')
        let comm_textarea = $('#comment_reply_form_'+id+' textarea')
        let send_btn_label = $('#comment_reply_form_'+id+' label')
        
        comm_reply_form.attr('style', 'display: block')

        function comm_input_state (){
        
            if (comm_textarea.val() != ''){
    
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
        
        comm_textarea.focus()
        comm_textarea.on('keydown', comm_input_state)
        comm_textarea.on('keyup', comm_input_state)

        document.addEventListener('click', listener = function () {close_comm_form(id, allcomm_id, event)})
    }

    let listener = function () {close_comm_form(id, allcomm_id, event)}

    function close_comm_form(id, allcomm_id, event){
        let btn = $('#comment_reply_btn_'+id)[0]
        let elem = $('#comment_reply_form_'+id)[0]

        if (event.target === elem || elem.contains(event.target)
        || event.target === btn || btn.contains(event.target)) {
            return
        }

        elem.setAttribute('style', 'display: none')
        document.removeEventListener('click', listener)
    }

    let childs_comments = $('.child_comment')
    
    for (let i=0; i<childs_comments.length; i++) {
        let class_name = childs_comments[i].getAttribute('class')
        let child = $('#'+childs_comments[i].id)

        let parent_id = class_name.slice(class_name.lastIndexOf('_')+1, class_name.length)
        let parent_comm_position = $('#comment_'+parent_id).position().left
        let main_container = $('main')

        child.offset({left: parent_comm_position+25})

        if (child.position().left + parseInt(child.css('width')) > 
            main_container.position().left + parseInt(main_container.css('width'))){
                
                child.offset({left: parent_comm_position})
        }
        
    }
    comments_visual_separation()
}