$(function() {
    
    likes_options()

});

function like_send_ajax(like_id){
   
    $.ajax({
        url: '/catalog/like/?like_id='+like_id,
        method: 'get',
        dataType: 'json',
        success: function(data){
            let likes = data.likes_html
            $('#likes_container_'+like_id).html(likes)

            likes_options()
        }
    })
}

function likes_options(){

    let labels_likes_containers = $('.label_likes_container')

    function like_send_ajax_event(){
    
        $.each(labels_likes_containers, function(ind, like){
            let like_id = like.id.slice(like.id.lastIndexOf('_')+1)
    
            if ($(window).outerWidth() > 1000) {
                $(like).off('click').on('click', function(){like_send_ajax(like_id)})
            }
            else {
                new TapEvent ($(like), 250, {
                            tap_event: function(){like_send_ajax(like_id)},
                            tap_hold_event: function(){get_users_liked_container_hover($(like))}
                })
                console.log('Мобильный вид, включилось событие тапа')
            }
        })
    }

    if ($(window).outerWidth() > 1000) {
        console.log('Desktop версия')
        for (let i=0; i<labels_likes_containers.length; i++) {
            let label_likes_containers = $('#'+labels_likes_containers[i].id)
            label_likes_containers.on('mouseover', get_users_liked_container_hover.bind(null, label_likes_containers))
        }
    }

    function get_users_liked_container_taphold(label_container) {

    }

    function get_users_liked_container_hover(label_container) {

        let users_liked_container = $(
                '<div class="users_liked_container popup"></div>')
        let id = label_container.attr('id').slice(
            label_container.attr('id').lastIndexOf('_')+1, label_container.attr('id').length)

        users_liked_container.html($('#users_liked_container_'+id).html())
        $('body').prepend(users_liked_container)

        label_container.addClass('hover')
        users_liked_container.on('mouseover', ()=>{users_liked_container.addClass('hover')})

        label_container.on('mouseleave', remove_hover_class.bind(null, users_liked_container, label_container))
        users_liked_container.on('mouseleave', remove_hover_class.bind(null, users_liked_container, label_container))
        
        label_container.on('mouseleave', close_popup.bind(null, users_liked_container, label_container))
        users_liked_container.on('mouseleave', close_popup.bind(null, users_liked_container, label_container))

        if ($(window).outerWidth() < 1000) {

            // Версия mobile
            users_liked_container.offset({
                top: $(window).scrollTop() + ($(window).height()/2) - (users_liked_container.height()/2)
            })
        }
        else {

            // Версия destop
            users_liked_container.offset({
                top: label_container.offset().top - users_liked_container.height() - label_container.height() - 10,
                left: label_container.offset().left
            })
        }
    }

    function remove_hover_class (like_label, likes_container) {
        
        like_label.removeClass('hover')
        likes_container.removeClass('hover')
    }

    function close_popup(elem, btn) {

        setTimeout(function() {

            if (!btn.hasClass('hover') && !elem.hasClass('hover')) {
                elem.remove()
            }
        }, 500)
    }
    like_send_ajax_event()
}