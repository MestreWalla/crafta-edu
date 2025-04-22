$(function () {
    $(".silaba").draggable({
        helper: "clone",
        revert: "invalid"
    });

    $(".zona-soltar").droppable({
        accept: ".silaba",
        hoverClass: "zona-soltar-hover",
        drop: function (event, ui) {

            let textoDaSilaba = ui.draggable.text();

            $(this).text(textoDaSilaba);

            $(this).addClass("preenchido");
        }
    });

    $(".silaba, .zona-soltar").disableSelection();
});

function montarPalavra() {

    let caixa1 = document.getElementById("silaba1");
    let caixa2 = document.getElementById("silaba2");
    
    let textoNaCaixa1 = caixa1.innerText;
    let textoNaCaixa2 = caixa2.innerText;

    let textoOriginalCaixa1 = "Sílaba 1";
    let textoOriginalCaixa2 = "Sílaba 2";

    let palavraMontada = "";
    if (textoNaCaixa1 != textoOriginalCaixa1) {
        palavraMontada = palavraMontada + textoNaCaixa1;
    }
    if (textoNaCaixa2 != textoOriginalCaixa2) {
        palavraMontada = palavraMontada + textoNaCaixa2;
    }

    let divResultado = document.getElementById("resultado");
    if (palavraMontada != "") {
        divResultado.innerHTML = "Palavra formada: <strong>" + palavraMontada + "</strong>";
    } else {
        divResultado.innerHTML = "Palavra formada: (Arraste as sílabas)";
    }
}