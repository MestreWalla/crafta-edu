$(function () {
    $(".silaba").draggable({
        // helper: "clone",  // REMOVIDO
        revert: "invalid"
    });

    $(".zona-soltar").droppable({
        accept: ".silaba",
        hoverClass: "slot-soltar-hover",
        drop: function (event, ui) {
            let dragged = ui.draggable;      // o próprio <li> arrastado
            let dropZone = $(this);

            // 1. Limpa a zona
            dropZone.empty();

            // 2. Desanexa o elemento da lista original
            dragged.detach()
                   // 3. Remove estilos de posicionamento in-line
                   .css({ top: "", left: "", position: "" })
                   // 4. Anexa dentro da zona de soltar
                   .appendTo(dropZone)
                   // 5. Marca como preenchido
                   .addClass("preenchido");

            dropZone.removeClass("text-muted");
        }
    });

    $(".silaba, .zona-soltar").disableSelection();
});

function montarPalavra() {
    const possibilidades = ["BOLA", "BOLO", "CASA", "BOCA", "COPO", "DADO", "FACA", "GATO", "GOLA", "LAMA", "LATA", "LOBO", "MALA", "MAPA", "MOLA", "PATO", "SAPO", "SOPA", "TOCA", "MACA", "FALA", "BEBE", "COME", "BALA", "CABO"];

    let textoNaCaixa1 = $("#silaba1").text().trim();
    let textoNaCaixa2 = $("#silaba2").text().trim();
    let palavraMontada = "";

    if (textoNaCaixa1 !== "") {
        palavraMontada = palavraMontada + textoNaCaixa1;
    }

    if (textoNaCaixa2 !== "") {
        palavraMontada = palavraMontada + textoNaCaixa2;
    }

    let divResultado = document.getElementById("resultado");

    if (palavraMontada === "") {
        divResultado.innerHTML = "Palavra formada: (Arraste as sílabas)";
    } else if (possibilidades.includes(palavraMontada)) {
        divResultado.innerHTML = "<strong>" + palavraMontada + "</strong>";
    } else {
        divResultado.innerHTML = "Palavra formada: (inválida)";
    }
}