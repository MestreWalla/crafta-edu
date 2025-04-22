$(function () { // jQuery p arrastar elemento
    $(".silaba").draggable({
        helper: "clone",
        revert: "invalid"
    });

    $(".zona-soltar").droppable({
        accept: ".silaba", // Aceita apenas elementos com a classe .silaba
        hoverClass: "slot-soltar-hover", // Classe para feedback visual ao passar por cima
        drop: function (event, ui) {
            // 'ui.draggable' é o elemento original que foi arrastado (o <li> da lista)
            let draggedSyllable = ui.draggable;

            // '$(this)' é a zona onde o elemento foi solto (o <div> .zona-soltar)
            let dropZone = $(this);

            // 1. Limpa o conteúdo atual da zona de soltar
            // Remove o texto "Solte a Sílaba X aqui" ou qualquer sílaba anterior
            dropZone.empty();

            // 2. Clona o elemento da sílaba original
            // Isso permite que a sílaba original permaneça na lista superior
            let syllableClone = draggedSyllable.clone();

            // 3. Remove classes/estilos extras do clone que podem ter sido adicionados pelo jQuery UI durante o arraste (opcional, mas boa prática)
            syllableClone.removeClass("ui-draggable-dragging ui-draggable");
            // Adiciona uma classe específica se quiser estilizar a sílaba *dentro* da zona (opcional)
            // syllableClone.addClass("silaba-na-zona");

            // 4. Anexa o clone da sílaba à zona de soltar
            dropZone.append(syllableClone);

            // 5. Adiciona a classe 'preenchido' para indicar que a zona tem algo
            // (Você pode usar isso para estilização, se necessário)
            dropZone.addClass("preenchido");

            // Opcional: Remover a classe 'text-muted' se ela estava no placeholder
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