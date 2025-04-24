$(function () {
    $(".silaba").draggable({
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
        }
    });
    $(".silaba, .zona-soltar").disableSelection();
});

// Variável para controlar a próxima posição disponível no dicionário
let proximaPosicaoDicionario = 1;

function montarPalavra() {
    const possibilidades = ["BOLA", "BOLO", "CASA", "BOCA", "COPO", "DADO", "FACA", "GATO", "GOLA", "LAMA", "LATA", "LOBO", "MALA", "MAPA", "MOLA", "PATO", "SAPO", "SOPA", "TOCA", "MACA", "FALA", "BEBE", "COME", "BALA", "CABO"];

    let textoNaCaixa1 = $("#silaba1").text();
    let textoNaCaixa2 = $("#silaba2").text();
    let palavraMontada = "";

    if (textoNaCaixa1 !== "") {
        palavraMontada = palavraMontada + textoNaCaixa1;
    }
    if (textoNaCaixa2 !== "") {
        palavraMontada = palavraMontada + textoNaCaixa2;
    }
    let divResultado = document.getElementById("resultado");
    if (palavraMontada === "") {
        divResultado.innerHTML = "(Arraste as sílabas)";
    } else if (possibilidades.includes(palavraMontada)) {
        // Define o conteúdo do resultado
        let conteudoResultado = "";
        if (palavraMontada === "BOCA") {
            conteudoResultado = '<img class="icone" src="/assets/icons/boca.png" alt="boca" title="BOCA">';
        } else if (palavraMontada === "BOLA") {
            conteudoResultado = '<img class="icone" src="/assets/icons//bola.png" alt="bola" title="BOLA">';
        } else {
            conteudoResultado = "<strong>" + palavraMontada + "</strong>";
        }
















        // Atualiza o resultado
        divResultado.innerHTML = conteudoResultado;

        // Adiciona ao dicionário após um pequeno delay
        setTimeout(function () {
            adicionarAoDicionario(conteudoResultado);
        }, 500);
    } else {
        divResultado.innerHTML = "(inválida)";
    }
}
function adicionarAoDicionario(conteudo) {
    // Verifica se ainda há espaço no dicionário
    if (proximaPosicaoDicionario <= 8) {
        const espacoDicionario = document.getElementById("dicionario" + proximaPosicaoDicionario);

        // Cria um elemento para o dicionário
        const elementoDicionario = document.createElement("div");
        elementoDicionario.className = "palavra-dicionario";
        elementoDicionario.innerHTML = conteudo;

        // Adiciona ao dicionário
        espacoDicionario.appendChild(elementoDicionario);

        // Avança para a próxima posição
        proximaPosicaoDicionario++;

        // Limpa a área de montagem
        limparAreaMontagem();
    } else {
        alert("Seu dicionário está cheio!");
    }
}

function limparAreaMontagem() {
    // Simplesmente remove as sílabas da área de montagem
    $("#silaba1, #silaba2").empty();

    // Limpa o resultado
    document.getElementById("resultado").innerHTML = "";
}