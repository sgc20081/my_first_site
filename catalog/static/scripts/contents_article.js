$(function () {

    make_table_of_contents_article()

})

function make_table_of_contents_article() {

    let h2 = $(".text_article h2");
    let h2_text = h2.textContent;

    for (let i=0; i<h2.length; i++) {
        h2[i].setAttribute("id", "article_h2_"+i);
        
        let li = $('<li></li>');
        $(".table_of_contents_body ul").append(li);

        let a = $("<a></a>");
        li.append(a);

        a.html(h2[i].textContent+"<br>");
        a.attr("href", "#"+h2[i].id);
        a.attr('title', h2[i].textContent)
    }
}