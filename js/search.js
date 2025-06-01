// Variável para guardar o HTML original do dicionário
let conteudoOriginalDicionario = null;

$(function () {
  const $searchInput = $(".search-container");
  const $dicionarioGrid = $(".dicionario-grid");

  // Ao digitar na searchbar
  $searchInput.on("input", function () {
    const termo = $(this).val().toUpperCase().trim();

    // Se for a primeira vez que entramos em busca, guardamos o conteúdo original
    if (conteudoOriginalDicionario === null) {
      conteudoOriginalDicionario = $dicionarioGrid.html();
    }

    if (termo !== "") {
      // Limpa a grid atual
      $dicionarioGrid.empty();

      // Percorre todas as palavras válidas e filtra as que começam com o termo
      Object.keys(PALAVRAS_VALIDAS).forEach(function (palavra) {
        if (palavra.startsWith(termo)) {
          // Cria a estrutura de div dentro de div, conforme o HTML de dicionário
          const imgSrc = PALAVRAS_VALIDAS[palavra];
          const $wrapper = $("<div>").addClass("i"); // mesma classe das células originais
          const $icone = $(`
            <div class="search-icon">
              <img class="icone-search" src="../../assets/icons/${imgSrc}" 
                   alt="${palavra}" title="${palavra}">
            </div>
          `);
          $wrapper.append($icone);
          $dicionarioGrid.append($wrapper);
        }
      });
    } else {
      // Se o campo foi limpo, restauramos o conteúdo original
      $dicionarioGrid.html(conteudoOriginalDicionario);
      conteudoOriginalDicionario = null;
    }
  });
});
