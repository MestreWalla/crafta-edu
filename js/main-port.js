$(() => { // forma mais curta de escrever funcao (Arrow Function)
  const $silabas = $(".silaba") // cria constante $silaba ($ mostra que e jQuery) onde pega todos elementos com classe .silaba
    .draggable({ revert: "invalid" }) // volta caso soltar em zona nao permitida
    .disableSelection(); // impede que o texto seja seleciona !Revisar!

  $(".zona-soltar") // pega elementos que tem classe .zona-soltar
    .droppable({ // plugin "droppale()" nativo do jQuery UI (pacote complementar do jQuery)
      accept: ".silaba", // aceita arrastar apenas elementos com classe .silaba
      hoverClass: "slot-soltar-hover", // quando hover em cima da zona permitida sera adiciona classe slot-soltar-hover
      drop(event, ui) { // event= evento do navegador; ui= objeto que contem referencias ao elementos que esta sendo arrastado
        const $dragged = ui.draggable // guarda em uma constante o elemento que foi arrastado, o 'ui' que auxilia nisso (ja que ele contem info do elemento arrastado)
          .detach() // remove elemento do html (parte visivel), porem guarda ele na memoria. Ele remove do lugar original com tudo 100%, sem perder nada
          .css({ top: "", left: "", position: "" }); // zera estilos que o jQuery colocou automaticamente (evita problemas apos soltar)

        $(this).empty().append($dragged); // remove e anexa o item na zona de soltar
      },
    })
    .disableSelection(); // impede que o texto seja seleciona !Revisar!
});


// variável para controlar a próxima posição disponível no dicionário
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
            conteudoResultado = '<img class="icone" src="../../assets/icons/boca.png" alt="boca" title="BOCA">';
        } else if (palavraMontada === "BOLA") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/bola.png" alt="bola" title="BOLA">';
        } else if (palavraMontada === "COPO") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/copo.png" alt="copo" title="COPO">';
        } else if (palavraMontada === "FACA") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/faca.png" alt="faca" title="FACA">';
        } else if (palavraMontada === "GATO") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/gato.png" alt="gato" title="GATO">';
        } else if (palavraMontada === "CABO") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/cabo.png" alt="cabo" title="CABO">';
        } else if (palavraMontada === "BALA") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/bala.png" alt="bala" title="BALA">';
        } else if (palavraMontada === "MAPA") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/mapa.png" alt="mapa" title="MAPA">';
        } else if (palavraMontada === "MOLA") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/mola.png" alt="mola" title="MOLA">';
        } else if (palavraMontada === "SAPO") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/sapo.png" alt="sapo" title="SAPO">';
        } else if (palavraMontada === "DADO") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/dado.png" alt="dado" title="DADO">';
        } else if (palavraMontada === "BOLO") {
            conteudoResultado = '<img class="icone" src="../assets/icons/bolo.png" alt="bolo" title="BOLO">';
        } else if (palavraMontada === "PATO") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/pato.png" alt="pato" title="pato">';
        } else if (palavraMontada === "LAMA") {
            conteudoResultado = '<img class="icone" src="../../assets/icons/lama.png" alt="lama" title="lama">';
        }
        else {
            conteudoResultado = "<strong>" + palavraMontada + "</strong>";
        }

        // Atualiza o resultado
        divResultado.innerHTML = conteudoResultado;

        // Adiciona ao dicionário após um pequeno delay
        setTimeout(function () {
            adicionarAoDicionario(conteudoResultado);
        }, 500);
    } else {
        divResultado.innerHTML = "❌";
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
    // Remove totalmente as sílabas da área de montagem
    $("#silaba1, #silaba2").empty();

    // Limpa o resultado
    document.getElementById("resultado").innerHTML = "";
}