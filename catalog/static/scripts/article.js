$(function() {

    article_options()

})

function article_options() {
    
    let article_options_menu = new PopupSlideAnimate($('.article_options_menu_container'), 
                                    $('.article_options_btn'),
                                    {sliding_side: 'left'})
}