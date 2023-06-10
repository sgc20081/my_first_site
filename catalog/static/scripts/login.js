$(document).ready(function(){
    


});

function login_ajax_options() {

    $(".login_form").off('sub,it').on('submit', function(e){
        
        e.preventDefault(); // Отменяем стандартное поведение браузера при отправке формы
        
        let form_data = $(this).serialize(); // Сериализуем данные формы
        let redirect_page = $('.redirect_page').text()

        $.ajax({
            type: "POST",
            url: "/catalog/login?next="+redirect_page,
            data: form_data,
            dataType: "json",
            success: function(data){

                if (data.redirect == true) {
                    console.log('Происходит редирект')
                    window.location.replace(redirect_page);
                }
                else {
                    console.log('Редирект не происходит')

                    let login_container = $(data.login_form).find('.login_container')

                    $('.login_container').html(login_container.html())

                    login_ajax_options()
                }
            },
        });
    });
}