$(document).ready(function() {
    // Make numbers and operators draggable
    $('.numero, .operador').draggable({
        helper: 'clone',
        revert: 'invalid',
        zIndex: 100,
        start: function() {
            $(this).css('opacity', '0.7');
        },
        stop: function() {
            $(this).css('opacity', '1');
        }
    });

    // Set up drop zones for numbers
    $('#numero1, #numero2').droppable({
        accept: '.numero',
        hoverClass: 'ui-droppable-hover',
        tolerance: 'pointer',
        drop: function(event, ui) {
            $(this).empty()
                   .addClass('preenchido')
                   .append(ui.draggable.clone().removeClass('ui-draggable-dragging'))
                   .data('valor', ui.draggable.text());
        }
    });

    // Set up drop zone for operators
    $('#operador').droppable({
        accept: '.operador',
        hoverClass: 'ui-droppable-hover',
        tolerance: 'pointer',
        drop: function(event, ui) {
            $(this).empty()
                   .addClass('preenchido')
                   .append(ui.draggable.clone().removeClass('ui-draggable-dragging'))
                   .data('valor', ui.draggable.text());
        }
    });

    // Clear drop zones when clicking on them
    $('.zona-soltar').click(function() {
        if ($(this).hasClass('preenchido')) {
            $(this).removeClass('preenchido')
                   .text($(this).attr('id') === 'numero1' ? 'Solte o Número 1 aqui' : 
                         $(this).attr('id') === 'operador' ? 'Solte o Operador aqui' : 
                         'Solte o Número 2 aqui')
                   .removeData('valor');
        }
    });

    // Disable text selection on draggable elements
    $('.numero, .operador, .zona-soltar').disableSelection();

    // Initialize calculation button
    $('.btn-success').click(calcular);
});

function calcular() {
    const numero1 = $('#numero1').data('valor');
    const operador = $('#operador').data('valor');
    const numero2 = $('#numero2').data('valor');
    const resultadoContainer = $('#resultado');

    // Validate all fields are filled
    if (!numero1 || !operador || !numero2) {
        resultadoContainer.html('<span class="resultado" style="background-color: #7f8c8d" >?</span>');
        return;
    }

    // Convert to numbers
    const num1 = parseFloat(numero1);
    const num2 = parseFloat(numero2);

    let resultado;
    let isValid = true;
    let bgColor;

    // Set background color based on operator
    switch (operador) {
        case '+':
            bgColor = '#3498db'; // Matches tipo="B" and first operator
            resultado = num1 + num2;
            break;
        case '-':
            bgColor = '#e74c3c'; // Matches second operator
            resultado = num1 - num2;
            break;
        case '*':
            bgColor = '#f1c40f'; // Matches third operator
            resultado = num1 * num2;
            break;
        case '/':
            bgColor = '#9b59b6'; // Matches fourth operator
            if (num2 === 0) {
                resultadoContainer.html('<span class="resultado" style="background-color: #7f8c8d">Divisão por zero!</span>');
                return;
            }
            resultado = num1 / num2;
            // Round to 2 decimal places for division
            resultado = Math.round(resultado * 100) / 100;
            break;
        default:
            resultadoContainer.html('<span class="resultado" style="background-color: #7f8c8d">Operador inválido</span>');
            return;
    }

    if (isValid) {
        // Display result with the .resultado style and dynamic background color
        resultadoContainer.html(`<span class="resultado" style="background-color: ${bgColor}">${resultado}</span>`);
    }
}

// Additional helper function to reset the calculator
function resetCalculator() {
    $('.zona-soltar').removeClass('preenchido')
                     .text(function() {
                         const id = $(this).attr('id');
                         return id === 'numero1' ? 'Solte o Número 1 aqui' : 
                                id === 'operador' ? 'Solte o Operador aqui' : 
                                'Solte o Número 2 aqui';
                     })
                     .removeData('valor');
    $('#resultado').text('...');
}