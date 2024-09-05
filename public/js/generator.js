let cssPicked = {
    'headerText': {
        'color': '#2465f2',
        'font-size': '50px'
    },
    'inputBody': {
        'background-color': '#fac566',
        'color': '#000',
        'font-size': '12px',
        'border-radius': '7px'
    },
    'tableHeading': {
        'color': '#1d1d1f',
        'font-size': '14px'
    },
    'ratings': {
        'btnBackground': "#fac566",
        'color': '#202859',
        'rateColor': '#2465f2'
    }
};

$('h1.header').on('click', (e) => {
    $('.active').removeClass('active');
    $('.active-tab').removeClass('active-tab');

    $(e.currentTarget).addClass('active');
    $('.header-config').addClass('active-tab');

    const colorPicker = document.getElementById('titleColor');
    const titleFontSize = document.getElementById('titleFontSize');

    colorPicker.addEventListener('input', (event) => {
        $('#text').css('color', event.target.value)
        cssPicked.headerText.color = event.target.value;
    });

    titleFontSize.addEventListener('input', (event) => {
        $('#text').css('font-size', `${event.target.value}px`)
        cssPicked.headerText["font-size"] = `${event.target.value}px`;
    });

    console.log(cssPicked)
})

$('#BgInput').on('click', (e) => {
    if (e.originalEvent) {
        $('.active').removeClass('active');
        $('.active-tab').removeClass('active-tab');
    
        $('.input-field-config').addClass('active-tab');
        $(e.currentTarget).addClass('active');
    
        const bgInputColor = document.getElementById('inputBgColor');
        const inputLabelTextColor = document.getElementById('inputLabelTextColor');
        const labelFontSize = document.getElementById('labelFontSize');
        const borderRadiusInputBg = document.getElementById('borderRadiusInputBg');
    
        bgInputColor.addEventListener('input', (event) => {
            $('#BgInput').css('background', event.target.value)
            $('.hsBczI > .select-combobox > .select-open-menu-button > .icon-chevron').css('stroke', event.target.value)
            cssPicked.inputBody["background-color"] = event.target.value;
        })
    
        inputLabelTextColor.addEventListener('input', (event) => {
            $('.rh-text-m').css('color', event.target.value)
            cssPicked.inputBody.color = event.target.value;
        })
    
        labelFontSize.addEventListener('input', (event) => {
            $('.rh-text-m').css('font-size', `${event.target.value}px`)
            cssPicked.inputBody["font-size"] = `${event.target.value}px`
        })
    
        borderRadiusInputBg.addEventListener('input', (event) => {
            $('#rangeValue').val(`${event.target.value}px`)
            $('#BgInput').css('border-radius', `${event.target.value}px`)
            cssPicked.inputBody["border-radius"] = `${event.target.value}px`
        })
    }
})

$('.table-heading').on('click', (e) => {
    $('.active').removeClass('active');
    $('.active-tab').removeClass('active-tab');

    $(e.currentTarget).addClass('active');
    $('.table-heading-config').addClass('active-tab');

    const tableHeadingColor = document.getElementById('tableHeadingColor');
    const tableHeadingFontSize = document.getElementById('tableHeadingFontSize');

    tableHeadingColor.addEventListener('input', (event) => {
        $('th.table-header-cell.rh-text-s.weight-regular.rh-fg-stone-darkest.rh-text-align-left.rh-px-0_75.rh-py-0_25').css('color', event.target.value)
        cssPicked.tableHeading.color = event.target.value;
    });

    tableHeadingFontSize.addEventListener('input', (event) => {
        $('th.table-header-cell.rh-text-s.weight-regular.rh-fg-stone-darkest.rh-text-align-left.rh-px-0_75.rh-py-0_25').css('font-size', `${event.target.value}px`)
        cssPicked.tableHeading["font-size"] = event.target.value;
    });
})

$('.best-mortgage-rates-table tbody').on('click', (e) => {
    $('.active').removeClass('active');
    $('.active-tab').removeClass('active-tab');

    $(e.currentTarget).addClass('active');
    $('.table-body-config').addClass('active-tab');

    const btnBgColor = document.getElementById('btnBgColor');
    
    btnBgColor.addEventListener('input', (event) => {
        $('.gGua-Dl').css('background', event.target.value);
        cssPicked.ratings.btnBackground = event.target.value;
    })
    
    const BtnTextColor = document.getElementById('BtnTextColor');
    
    BtnTextColor.addEventListener('input', (event) => {
        $('.gGua-Dl').css('color', event.target.value);
        cssPicked.ratings.color = event.target.value;
    })
    
    const rateTextColor = document.getElementById('rateTextColor');
    rateTextColor.addEventListener('input', (event) => {
        $('.rh-fg-blueberry-dark').css('color', event.target.value);
        cssPicked.ratings.rateColor = event.target.value;
    })
})


async function generateIframeCode() {
    // Get user input values
    const url = 'https://frank-rate-tool.onrender.com/rate-tool';

    // Display the generated iframe code in the textarea
    await fetch('/api/save-to-storage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cssPicked)
    })
    .then(res => res.json())
    .then(res => {
        // Create the iframe HTML code with custom attributes
        const iframeCode = `<iframe src="${url}?token=${res.token}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    
        $('.container').show()
        document.getElementById('iframeCode').value = iframeCode;
    }).catch(er => console.log(er))
}

function copyCode() {
    var textarea = document.getElementById("iframeCode");
    textarea.select();
    textarea.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");
    alert("Code copied to clipboard!");
}