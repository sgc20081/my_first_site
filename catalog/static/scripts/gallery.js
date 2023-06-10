$(function() {
    
    let new_img_form = new PopupContent($('.gallery_new_img_form_container'), $('body'), 'yes')
    
    let gallery_options_menu = new PopupSlideAnimate($('.gallery_options_menu_container'), $('.gallery_options_btn'))
    
    $('.gallery_delete_btn').on('click', ()=>{
        console.log('Пытаюсь создать попашку')
        gallery_delete_popup = new PopupContent($('.gallery_delete_confirm_container'), $('body'), 'yes')
        gallery_delete_popup.show_popup()
        console.log('На этом этапе попап должен был быть создан')
    })
        
    let popup_show_btn = $('.gallery_img_popup_btn')
    popup_show_btn.on('click', ()=>{
                    new_img_form.show_popup()
                    new_img_upload()
                    })
        

    imageChangeSelected()

    let images = $('.gallery_img')

    $.each(images, function(ind, img){
        
        let img_id = img.id.slice(img.id.lastIndexOf('_')+1)
        img = $('#'+img.id)

        $(img).on('click.img_'+img_id, function(event){

            if (event.target == $('.galleryImageSelected')[0]) {
                return
            }
            
            $('.galleryImageSelected').removeClass('galleryImageSelected');
            img.addClass('galleryImageSelected')

            $.ajax({
                url: window.location.href+'?image='+img_id,
                method: 'get',
                dataType: 'html',
                success: function(data){
                    //console.log('Это полный ответ от сервера: ', JSON.parse(data))
                    data = JSON.parse(data)

                    let img = JSON.parse(data.big_img)[0].fields
                    
                    $('.gallery_big_img').attr('src', '/catalog/'+img.image)
                    $('.gallery_big_img_text_container p').text(img.image_text_description)
                    
                    $('.likes_container').html(data.likes_render)
                    $('.comments_container').html(data.comments_render)
                    
                    // Эта функция придаёт нужный внешний вид комментариям, она идёт из файла comments.js
                    comments_options()
                    
                    // Эта функции придаёт нужный внешний вид лайкам и включает возможность отправлять лайки на сервер, 
                    // она идут из файла likes.js
                    likes_options()
                }
            })
        })
    })
});

function imageChangeSelected() {

    if ($('.gallery_big_img').length != 0){
        let big_img = $('.gallery_big_img')[0]
        let big_img_id = big_img.id.slice(big_img.id.lastIndexOf('_')+1, big_img.id.length)
        let img_sel = $('#image_'+big_img_id)

        img_sel.addClass('galleryImageSelected')
    }
}

function new_img_upload() {

    let img_input = $('.popup #id_image')
    img_input.attr('id', 'id_image_copy')

    $('.popup label').attr('for', 'id_image_copy')

    img_input.on('change', function(){

        let img_file = img_input[0].files[0]
        let img_url = URL.createObjectURL(img_file)

        $('.gallery_new_img_preview_container img').attr('src', img_url)
        URL.revokeObjectURL(img_url)
    })
}

