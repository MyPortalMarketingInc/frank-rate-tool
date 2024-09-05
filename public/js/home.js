let apiKey = "AIzaSyAm5D137xAS6hz6q6Bsg8PboHmgkTyoTIQ"
let airTableToken = "patb5hwKCSoLl2Uuz.175cc452283fcfcd2822b88a5e2317d4baeb33ed589db4fe855e86fb562b0ed3"
let transaction = 'buyAhome';

let static = {
    'million': 1000000,
    'min': 500000,
    'fivePercent': 5,
    'twintyPercent': 20,
    'hundred': 100,
    'tenPercent': 10
}

let mortgageRate = {
    'INSUREDRATE': 'INSUREDRATE',
    'INSURABLERATE': 'INSURABLERATE',
    'UNINSUREDRATE': 'UNINSUREDRATE',
    'UNINSUREDRATE30Y': 'UNINSUREDRATE30Y',
    'RENTALRATE': 'RENTALRATE',
    'RENTALRATE30Y': 'RENTALRATE30Y'
}

let amortizationYears = {
    'THIRTYYEARS': 30,
    'TWINTYFIVEYEARS': 25,
    'LESSTHANTWINTYFIVEYEARS': 25
}

let MortgageTypeEnum = {
    'VARIABLE': 'Variable',
    'FIXED': 'Fixed'
}

let foundData = [];
let allRecords = [];

let buyAHome = {
    'purpose': 'Owner-occupied',
    'province': 'ALL',
    'purchasePrice': 500000,
    'downPayment': 25000,
    'percent': 5,
    'amortization': '25-year'
}

let renewSwitch = {
    'purpose': 'Owner-occupied',
    'province': 'ALL',
    'balance': 400000,
    'amortization': 'less than 25 year',
    'CMHC': 'Yes'
}

let refinance = {
    'purpose': 'Owner-occupied',
    'province': 'ALL',
    'balance': 400000,
    'funds': 0,
    'amortization': '25-year',
}

const canadianProvinces = [
    { name: "Alberta", abbreviation: "AB", value: "Alberta (AB), Canada" },
    { name: "British Columbia", abbreviation: "BC", value: "British Columbia (BC), Canada" },
    { name: "Manitoba", abbreviation: "MB", value: "Manitoba (MB), Canada" },
    { name: "New Brunswick", abbreviation: "NB", value: "New Brunswick (NB), Canada" },
    { name: "Newfoundland and Labrador", abbreviation: "NL", value: "Newfoundland and Labrador (NL), Canada" },
    { name: "Ontario", abbreviation: "ON", value: "Ontario (ON), Canada" },
];

/**
 * @description get the current location of the user
 * @param {string} apiKey google api key
 * @param {float} lat latitude
 * @param {float} lng longitude
 */
async function getLocation(apiKey, lat, lng) {
    await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${ lat },${ lng }&sensor=true&key=${apiKey}`)
        .then(res => res.json())
        .then(loc => {
            
            let location = ''
            loc.results[0].address_components.forEach(address => {
                if (canadianProvinces.find(province => province.abbreviation == address.short_name)) {
                    location = canadianProvinces.find(province => province.abbreviation == address.short_name);
                }
            })
            
            if (location != '') {
                $('#city').val(location.value)
                $('#helocCity').val(location.value)
                
                localStorage.setItem('_current_location', JSON.stringify(location))
            }
            
        })
        .catch(er => console.log(er))
} 

/**
 * @description start the program
 */
$(document).ready(async ()=> {
    // Get User's Location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
                async function (position) {
                    await getLocation(apiKey, position.coords.latitude, position.coords.longitude)
                    // await getLocation(apiKey,54.7174698, -113.2583189)
                },

                function (error) {
                    console.error('Error getting user location:', error);
                }

            );

    } else {
        console.error('Geolocation is not supported by this browser.');
    }

    /**
     *  @description This code coming from Frank Mortgage Backend Developer
     */

    /**
     * @description calculate the compound annual rate componded at compoundPeriodsPerYear
     * @param {real} rate 
     * @param {MortgageTypeEnum} mortgageType the mortgage type (fixed or variable)
     */
    const calcCompoundedRate = (rate, mortgageType) => {
        // FIXED rate mortgages are componded semi-annually
        // VARIABLE rate mortgages are componded monthly

        let compoundingPeriodsPerYear = 12;

        if (mortgageType === MortgageTypeEnum.VARIABLE) {
            compoundingPeriodsPerYear = 12;
        } else {
            compoundingPeriodsPerYear = 2;
        }

        let result = Math.pow((1 + rate / compoundingPeriodsPerYear), compoundingPeriodsPerYear / 12) - 1;
        
        return result;
    }

    /**
     * @description calculate the monthly payment amount
     * @param {decimal} mortgageAmount the mortgage amount
     * @param {real} annualRate the annual interest rate
     * @param {int} amortizationPeriodYears the amortization period years 
     * @param {MortgageTypeEnum} mortgageType mortage type (fixed or variable)
     */
    const calcMonthlyPayment = (mortgageAmount, annualRate, amortizationPeriodYears, mortgageType) => {
        // calculate monthly semi-annually compounded rate.

        let adjustedRate = annualRate;
        let monthlyRate = calcCompoundedRate(adjustedRate, mortgageType);
        let numPaymentPeriods = amortizationPeriodYears * 12;
        let principalAmount = mortgageAmount;

        return principalAmount * (monthlyRate * Math.pow((1 + monthlyRate), numPaymentPeriods) / (Math.pow((1 + monthlyRate), numPaymentPeriods) - 1));
    }

    /**
     * @description click the input field
     * @param {event} e 
     */
    $('input[type="text"]').on('click', (e) => {
        
        $(e.currentTarget).parents('.is-dropdown').toggleClass('is-open')
        
        let id = $(e.currentTarget).attr('id');
        
        $(`#${ id }-menu`).toggleClass('is-open')
        
        let openDropdown = $('.is-open');
        
        Object.values(openDropdown).forEach(el => {
            
            if ($(el).attr('id') != `${ id }-menu`) {
                $(el).removeClass('is-open')
            }
        })
        
    })
    
    /**
     * @description select option
     * @param {event} e 
     */
    $('.select-option').on('click', (e) => {
        $(e.currentTarget).parents('.is-dropdown').removeClass('is-open')
        
        let value = $(e.currentTarget).attr('id');
        
        $(e.currentTarget).parents('.select-menu').attr('aria-activedescendant', value).removeClass('is-open')
    })

    /**
     * @description adding class is-highlighted when in hover select options
     */
    $(".select-option").hover(
        function () {
            $(this).addClass("is-highlighted");
            $('#scenario-menu').attr('aria-activedescendant', $(this).attr('id'))
        },
        function () {
            $(this).removeClass("is-highlighted");
        }
    );
    
    /**
     * @description listening when click outside the boundary
     * @param {event} e 
     */
    $(document).on("click", function (event) {
        if ($(event.target).closest("#scenario").length === 0) {
            $('#scenario').parents('.is-dropdown').removeClass('is-open')
            $('#scenario-menu').attr('aria-activedescendant', null).removeClass('is-open')
        }

        if ($(event.target).closest("#purchaseRefinanceAmortization").length === 0) {
            $('#purchaseRefinanceAmortization').parents('.is-dropdown').removeClass('is-open')
            $('#purchaseRefinanceAmortization-menu').attr('aria-activedescendant', null).removeClass('is-open')
        }

        if ($(event.target).closest("#occupancy").length === 0) {
            $('#occupancy').parents('.is-dropdown').removeClass('is-open')
            $('#occupancy-menu').attr('aria-activedescendant', null).removeClass('is-open')
        }
        
        if ($(event.target).closest("#city").length === 0) {
            $('#city').parents('.is-dropdown').removeClass('is-open')
            $('#city-menu').attr('aria-activedescendant', null).removeClass('is-open')
        }
        
        if ($(event.target).closest("#isCMHC").length === 0) {
            $('#isCMHC').parents('.is-dropdown').removeClass('is-open')
            $('#isCMHC-menu').attr('aria-activedescendant', null).removeClass('is-open')
        }
        
    });

    /**
     * @description default load set transaction type value to Buying A Home
     */
    if ($('#scenario').val() == 'Buying a home') {
        $('.mortgage-filter-question-compact').attr('aria-hidden', 'true').addClass('rh-display-none')
        buyingHome()
    }

    /**
     * @description select transaction type
     * @param {event} e 
     */
    $("#scenario-menu .select-option").on('click', (e) => {
        $('#transaction-type #scenario').val($(e.currentTarget).text())
        $('.mortgage-filter-question-compact').attr('aria-hidden', 'true').addClass('rh-display-none')
        $('.filter-button').removeClass('rh-display-none')

        switch ($(e.currentTarget).attr('id')) {
            case 'scenario-item-0':
                buyingHome()
                break;

            case 'scenario-item-1':
                renewing()
                break;

            case 'scenario-item-2':
                refinancing()
                break;
            
            case 'scenario-item-3':
                homeEquity()
                break;
        
            default:
                break;
        }
    });

    /**
     * @description select amortization year
     * @param {event} e 
     */
    $('#purchaseRefinanceAmortization-menu .select-option, #renewAmortization-menu .select-option').on('click', (e) => {
        let amortization = $(e.currentTarget).text();

        if (!$(e.currentTarget).hasClass('not-allowed')) {
            $('#purchaseRefinanceAmortization').val(amortization)
            $('#renewAmortization').val(amortization)

            // Set the value in global
            buyAHome.amortization = amortization
            renewSwitch.amortization = amortization;
            refinance.amortization = amortization;

            // Call the API
            callTheApi();
        }
    })

    /**
     * @description select purpose type
     * @param {event} e 
     */
    $('#occupancy-menu .select-option').on('click', (e) => {
        let purpose = $(e.currentTarget).text();

        buyAHome.purpose = purpose
        refinance.purpose = purpose
        renewSwitch.purpose = purpose

        if (buyAHome.purpose == 'Rental' && transaction == 'buyAhome') {
            buyAHome.purchasePrice = static.min;
            buyAHome.percent = static.twintyPercent
        } else {
            buyAHome.percent = static.fivePercent
            buyAHome.amortization = '25-Year'
            $('#purchaseRefinanceAmortization').val(buyAHome.amortization)
        }
        
        $('#occupancy').val(purpose)

        // Call the API
        callTheApi()
    })
    
    /**
     * @description select province
     * @param {event} e 
     */
    $('#city-menu .select-option').on('click', (e) => {
        let province = $(e.currentTarget).text();
        let provinceCode = $(e.currentTarget).attr('id')

        $('#city').val(province)

        // Set value to global
        buyAHome.province = provinceCode;
        renewSwitch.province = provinceCode;
        refinance.province = provinceCode;

        // Call the API
        callTheApi()
    })

    /**
     * @description select CMHC yes or no
     * @param {event} e 
     */
    $('#isCMHC-menu .select-option').on('click', (e) => {
        $('#isCMHC').val($(e.currentTarget).text())

        // Set value to global
        renewSwitch.CMHC = $(e.currentTarget).text();

        // Call the API
        callTheApi()
    })

    let typingTimerPrice;
    let editField = 'purchasePrice';

    /**
     * @description listening to input keys in input type numeric
     */
    $('input[inputMode="numeric"]').on('keyup', function() {
        let inputVal = $(this).val().replace(/[^0-9]/g, '');

        // Check if inputVal is not empty
        if (inputVal) {
            // Parse the input value as an integer
            let intVal = parseInt(inputVal, 10);

            // Format the value as currency without decimal points
            let formattedVal = currency(intVal);

            if ($(this).attr('id') == 'homePrice') {
                buyAHome.purchasePrice = intVal
                editField = 'purchasePrice';

            } else if ($(this).attr('id') == 'downPayment.dollars') {
                buyAHome.downPayment = intVal
                editField = 'downPayment';
            }

            if ($(this).attr('id') == 'renewMortgageBalance') {
                renewSwitch.balance = intVal
                refinance.balance = intVal
            }
            
            if ($(this).attr('id') == 'additionalFunds') {
                refinance.funds = intVal;
            }

            // Check Purchase Price
            if (buyAHome.purchasePrice >= buyAHome.downPayment) {
                // Set the formatted value back to the input field
                // buyAHome.percent = calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment)

                $(this).val(formattedVal);
            } else {
                buyAHome.downPayment = buyAHome.purchasePrice
                $(this).val(currency(buyAHome.purchasePrice));
            }

            clearTimeout(typingTimerPrice);

            typingTimerPrice = setTimeout(callTheApi, 1000);
        } else {
            $(this).val('');
        }
    });

    let typingTimerPercent;

    /**
     * @description listening to input keys in input type of percent
     */
    $('#percentage .input').on('keyup', function() {
        if ($(this).attr('id') == 'downPayment.percent') {
            let percent = $(this).val();

            clearTimeout(typingTimerPercent);

            if (percent <= 100) {
                buyAHome.percent = percent
                editField = 'percentage';
            }

            typingTimerPercent = setTimeout(callTheApi, 1500);
        }
    });

    /**
     * @description validate the percentage
     */
    function validatePercent() {
        if (buyAHome.purchasePrice <= static.min) {
            if (buyAHome.purpose == 'Rental') {
                if (buyAHome.percent < static.twintyPercent) {
                    buyAHome.percent = static.twintyPercent;
                }
            } else {
                if (buyAHome.percent < static.fivePercent) {
                    buyAHome.percent = static.fivePercent;
                }
            }
        }

        if (buyAHome.purchasePrice >= static.million) {
            if (buyAHome.percent < static.twintyPercent) {
                buyAHome.percent = static.twintyPercent;
            }
        }
    }

    // Transaction types methods

    /**
     * @description display buying a home transaction type
     */
    function buyingHome() {
        $('#transaction-type, #percentage, #purchase-price, #location-bottom, #amortization-bottom, #occupancy-bottom')
        .attr('aria-hidden', 'false').removeClass('rh-display-none')

        // Set transaction type to Buy A Home
        transaction = 'buyAhome';

        // Call the API
        callTheApi()
    }

    /**
     * @description display Renew/Switch transaction type
     */
    function renewing() {
        $('#transaction-type, #current-balance, #amortization, #location-bottom, #occupancy-bottom, #cmhc-bottom')
        .attr('aria-hidden', 'false').removeClass('rh-display-none') 

        // Set transaction type to Renewing
        transaction = 'renewing';

        // Call the API
        callTheApi()
    }

    /**
     * @description display Refinancing transaction type
     */
    function refinancing() {
        $('#transaction-type, #current-balance, #additional-funds, #location-bottom, #amortization-bottom, #occupancy-bottom')
        .attr('aria-hidden', 'false').removeClass('rh-display-none') 

        // Set transaction type to Refinancing
        transaction = 'refinancing';

        // Call the API
        callTheApi()
    }

    /**
     * @description auto calculate the percentage
     * @param { float } PurchasePrice
     * @param {float} DownPayment 
     */
    function calcPercentage(PurchasePrice, DownPayment) {
        let percent = (( DownPayment / PurchasePrice ) * static.hundred).toFixed(2);

        if (percent == 'NaN') percent = 0

        // buyAHome.percent = percent;

        $($('#percentage .input')[0]).val(percent)

        return percent;
    }

    /**
     * @description calling the data form airtable or sessionStorage & filter data
     */
    async function callTheApi() {
        let html = ``;

        // Remove displayed data
        $('#best-market-rates table tbody tr').remove()

        // Buy A Home
        if (transaction == 'buyAhome') {
            // Get Data from AirTable or Session Storage

            // Buy a Home Logic Method
            html = await buyHomeLogic(html)
        }
        
        // Refinance
        if (transaction == 'refinancing') {
            // Get Data from AirTable or Session Storage

            // Convert to currency
            let ddp = currency(refinance.balance);
            $('#renewMortgageBalance').val(ddp)
            
            // Enable 30 Years Option
            enable30Years()

            // Check Amortization
            let unInsuredRate = refinance.amortization == '30-Year' ? mortgageRate.UNINSUREDRATE30Y : mortgageRate.UNINSUREDRATE;
            let rentalRate = refinance.amortization == '30-Year' ? mortgageRate.RENTALRATE30Y : mortgageRate.RENTALRATE;

            // Use Uninsured Rates unless the purpose is Rental
            if (refinance.purpose != 'Rental') {
                let data = await searchRate(unInsuredRate, renewSwitch)
                html = insertHtml(data, unInsuredRate)
            } else {
                let data = await searchRate(rentalRate, renewSwitch)
                html = insertHtml(data, rentalRate)
            }
            // html = refinance.purpose != 'Rental' ? insertHtml(foundData, unInsuredRate) : insertHtml(foundData, rentalRate);
        }

        // Renew / Switch
        if (transaction == 'renewing') {
            // Get Data from AirTable or Session Storage

            // Disable 30 Years Option
            disable30Years();

            if (renewSwitch.CMHC == 'Yes'){
                // Use the Insured Rates
                let data = await searchRate(mortgageRate.INSUREDRATE, renewSwitch)
                html = insertHtml(data, mortgageRate.INSUREDRATE)
            }

            if (renewSwitch.CMHC == 'No' && renewSwitch.balance < 650000) {
                // Use the Insurable Rates
                let data = await searchRate(mortgageRate.INSURABLERATE, renewSwitch)
                html = insertHtml(data, mortgageRate.INSURABLERATE)
            }

            if (renewSwitch.CMHC == 'No' && renewSwitch.balance > 650000) {
                // Use the UnInsurable Rates
                let data = await searchRate(mortgageRate.UNINSUREDRATE, renewSwitch)
                html = insertHtml(data, mortgageRate.UNINSUREDRATE)
            }

            // Display Yes option
            $('li#isCMHC-item-0').removeAttr('style').removeClass('not-allowed')

            if (renewSwitch.purpose == 'Rental') {
                renewSwitch.amortization = '25-year';
                renewSwitch.CMHC = 'No' // Do not allow to answer them Yes

                // Disable Yes option
                $('li#isCMHC-item-0').css({
                    'background-color': '#e7e7e7',
                    'cursor': 'not-allowed'
                }).addClass('not-allowed')

                // Set default Value
                $('#isCMHC').val('No')

                // Use Rental Rates
                let data = await searchRate(mortgageRate.RENTALRATE, renewSwitch)
                html = insertHtml(data, mortgageRate.RENTALRATE)
            }
        }

        // Display Data
        $('#best-market-rates table tbody').append(html)
    }

    /**
     * @description buy a home logic happens here
     * @param {string} html 
     * @returns html element
     */
    async function buyHomeLogic(html) {
        // Validate the percent
        validatePercent()

        // More than a million
        if (buyAHome.purchasePrice >= static.million) {
            // let p = static.twintyPercent / static.hundred;
            if (editField == 'purchasePrice') {
                buyAHome.percent = (( buyAHome.downPayment / buyAHome.purchasePrice ) * static.hundred).toFixed(2);
                if (buyAHome.percent < static.twintyPercent) buyAHome.percent = static.twintyPercent
                // if (buyAHome.percent > static.twintyPercent ) p = buyAHome.percent / static.hundred;
            }

            let p = buyAHome.percent / static.hundred;
            let dp = buyAHome.purchasePrice * p;
            let percent = calcPercentage(buyAHome.purchasePrice, dp)

            if (editField == 'downPayment') {
                dp = buyAHome.downPayment
                percent = calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment);
            }

            let ddp = currency(dp);

            buyAHome.percent = percent;
            buyAHome.downPayment = dp;
            
            $($('#percentage .input')[1]).val(ddp)
            $($('#percentage .input')[0]).val(percent)

            // Use Uninsured rate
            enable30Years();
            let unInsuredRate = buyAHome.amortization == '30-Year' ? mortgageRate.UNINSUREDRATE30Y : mortgageRate.UNINSUREDRATE;

            let data = await searchRate(unInsuredRate, buyAHome)
            html = insertHtml(data, unInsuredRate);
        }

        // Less than a million
        if (buyAHome.purchasePrice < static.million) {
            if (buyAHome.purchasePrice > static.min) {
                // 5% of the first 500k
                let p = static.fivePercent / static.hundred;
                let dp = static.min * p;
                
                // additional 10% of the difference
                let difference = (buyAHome.purchasePrice - static.min)
                let ap = static.tenPercent / static.hundred;
                let newDp = difference * ap

                // Add all downpayment
                let sum = dp + newDp;

                buyAHome.downPayment = editField == 'downPayment' ?  buyAHome.downPayment : sum;

                let ddp = currency(sum);
                $($('#percentage .input')[1]).val(ddp)

                let percent = calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment)

                if (editField == 'percentage' && parseFloat(buyAHome.percent) > parseFloat(percent)) {
                    p = buyAHome.percent / static.hundred;
                    dp = buyAHome.purchasePrice * p;
                    buyAHome.downPayment = dp;

                    let ddp = currency(dp);
                    $($('#percentage .input')[1]).val(ddp)
                    
                    calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment)
                }

                if (editField == 'downPayment') {
                    let ddp = currency(buyAHome.downPayment);
                    $($('#percentage .input')[1]).val(ddp)

                    calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment)
                }

            } else {
                if (editField == 'downPayment') {
                    let percent = calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment);
                    buyAHome.percent = percent
                }

                calculate();
            }

            if (buyAHome.percent < static.twintyPercent) {
                // use insured rates
                disable30Years()
                let data = await searchRate(mortgageRate.INSUREDRATE, buyAHome)
                html = insertHtml(data, mortgageRate.INSUREDRATE);
            }

            if (buyAHome.percent >= static.twintyPercent) {
                // use insurable rates
                disable30Years()
                let data = await searchRate(mortgageRate.INSURABLERATE, buyAHome)
                html = insertHtml(data, mortgageRate.INSURABLERATE);
            }
        }

        // Rental Purposes
        if (buyAHome.purpose == 'Rental') {

            if (editField == 'purchasePrice') {
                if (buyAHome.percent < static.twintyPercent) buyAHome.percent = static.twintyPercent
                // if (buyAHome.percent > static.twintyPercent ) p = buyAHome.percent / static.hundred;
            }
            // if (buyAHome.percent < static.twintyPercent) buyAHome.percent = static.twintyPercent
            calculate();

            let formattedVal = currency(buyAHome.purchasePrice);

            $('#homePrice').val(formattedVal)

            // Use Rental Rates
            enable30Years()
            let rentalRate = buyAHome.amortization == '30-Year' ? mortgageRate.RENTALRATE30Y : mortgageRate.RENTALRATE;

            let data = await searchRate(rentalRate, buyAHome)
            html = insertHtml(data, rentalRate);
        }

        // Validate Input Field
        validateInput()

        // Display Data
        return html
    }

    /**
     * @description disable the 30 years in amortization option
     */
    function disable30Years() {
        $('li#purchaseRefinanceAmortization-item-0').css({
            'background-color': '#e7e7e7',
            'cursor': 'not-allowed'
        }).addClass('not-allowed').hide();

        $('li#renewAmortization-item-0').css({
            'background-color': '#e7e7e7',
            'cursor': 'not-allowed'
        }).addClass('not-allowed').hide()
    }

    /**
     * @description enable the 30 years in amortization option
     */
    function enable30Years() {
        $('li#purchaseRefinanceAmortization-item-0').removeAttr('style').removeClass('not-allowed').show()
        $('li#renewAmortization-item-0').removeAttr('style').removeClass('not-allowed').show()
    }

    /**
     * @description calculate the down payment according to its percentage
     */
    function calculate() {
        let p = buyAHome.percent / 100;
        let dp = buyAHome.purchasePrice * p;

        buyAHome.downPayment = dp

        let ddp = currency(dp);
        $($('#percentage .input')[1]).val(ddp)

        calcPercentage(buyAHome.purchasePrice, buyAHome.downPayment)
    }

    /**
     * @description validate the input field of downpayment and percent
     */
    function validateInput() {
        if (buyAHome.purchasePrice >= static.million 
            && buyAHome.percent < static.twintyPercent 
            || buyAHome.percent == '' || buyAHome.purchasePrice < static.million 
            && buyAHome.percent < static.fivePercent
            || buyAHome.purpose == 'Rental' && buyAHome.percent < static.twintyPercent) 
            {
                for (var i = 0; i < 2; i++) {
                    $($('#percentage .input')[i]).parent().children('label').attr('style', 'color: red');
                    $($('#percentage .input')[i]).attr('style', `color: red; border-color: red !important;`)
                }
        } else {
            for (var i = 0; i < 2; i++) {
                $($('#percentage .input')[i]).parent().children('label').removeAttr('style')
                $($('#percentage .input')[i]).removeAttr('style')
            }
        }
    }

    /**
     * 
     * @param {int} mon number
     * @returns formatted currency with dollar sign
     */
    function currency(mon) {
        return mon.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    /**
     * @description inserting html element to be displayed in Rate tool
     * @param {Array} data data coming from airtable or sessionStorage
     * @param {MortgageTypeEnum} use mortgage type (fixed or variable)
     * @returns html element
     */
    function insertHtml(data, use) {
        let html = ``;

        for (var i = 0; i < data.length; i++) {
            let rate = data[i][0][use]
            let mortYears = data[i][0].MORTGAGE_TERMS_YEARS;
            let lenderTypeFixed = 'Bank'
            let lenderTypeVariable = 'Bank'
            
            let increaseMonthlyPaymentFixed = 15
            let prePaymentFixed = 15

            let increaseMonthlyPaymentVariable = 15
            let prePaymentFixedVariable = 15

            let fixed = ``;
            let variable = ``;

            // rate = data[i][0][use]
            // mortYears = data[i][0].MORTGAGE_TERMS_YEARS

            // If data contains array
            if (data[i].length > 1) {
                for (var j = 0; j < data[i].length; j++) {
                    if (data[i][j].MORTGAGETYPE == MortgageTypeEnum.FIXED) {
                        rate = data[i][j][use]
                        fixed = fixedOrVariable(rate)
                        lenderTypeFixed = data[i][j].LENDERTYPE 
                        increaseMonthlyPaymentFixed = data[i][j].INCREASEMONTLYPAYMENTS
                        prePaymentFixed = data[i][j].PREPAYMENT
                    }
                    if (data[i][j].MORTGAGETYPE == MortgageTypeEnum.VARIABLE) {
                        rate = data[i][j][use]
                        variable = fixedOrVariable(rate)
                        lenderTypeVariable = data[i][j].LENDERTYPE 
                        increaseMonthlyPaymentVariable = data[i][j].INCREASEMONTLYPAYMENTS
                        prePaymentFixedVariable = data[i][j].PREPAYMENT
                    }
                }

            } else {
                if (data[i][0].MORTGAGETYPE == MortgageTypeEnum.VARIABLE) {
                    variable = fixedOrVariable(rate)
                    lenderTypeVariable = data[i][0].LENDERTYPE 
                     
                    increaseMonthlyPaymentVariable = data[i][0].INCREASEMONTLYPAYMENTS
                    prePaymentFixedVariable = data[i][0].PREPAYMENT
                }
                if (data[i][0].MORTGAGETYPE == MortgageTypeEnum.FIXED) {
                    fixed = fixedOrVariable(rate)
                    lenderTypeFixed = data[i][0].LENDERTYPE 
                    increaseMonthlyPaymentFixed = data[i][0].INCREASEMONTLYPAYMENTS
                    prePaymentFixed = data[i][0].PREPAYMENT
                }
                
            }

            html += `<tr class="table-row" aria-hidden="false">
                        <td class="rh-p-1" data-years="${mortYears}">
                            <button target="blank"
                                class="show-details PageBehaviourButton__Button-sc-14g1f1v-0 jXtuuN full-width rh-mt-0_5 rh-box-sizing-border-box rh-display-flex rh-border-width-0 rh-p-0 rh-outline-none rh-font-family-gordita rh-fg-blackberry rh-text-s weight-regular hover--rh-fg-blueberry focus--rh-fg-blueberry active--rh-fg-blueberry-dark"
                                data-name="BMRTable-toggle-details">
                                <span class="TextElement__Text-sc-2c9j20-0 ktwbJe text-wrapper show-details-toggle" style="font-weight: 900;"> +
                                </span>
                            </button>
                        </td>
                        <td class=" rh-px-0_75 rh-py-1">
                            <p class="rh-title-2xs weight-medium rh-mt-0 rh-mb-0_5">
                                ${mortYears} Yr
                            </p>
                        </td>
                        <td class="table-cell-rate  rh-px-0_75 rh-py-1">
                            ${fixed}
                        </td>
                        <td class="table-cell-rate  rh-px-0_75 rh-py-1">
                            ${variable}
                        </td>
                        
                        <span>test</span>
                    </tr>
                    <tr class="hide-mobile hide-collapse collapse-${mortYears}">
                        <td></td>
                        <td></td>
                        <td class="collapsible ">
                            <div class="collapsible-wrapper collapse-fixed-${mortYears} hide-collapse">
                                <p>
                                    <span class="lender-type">Lender Type: ${lenderTypeFixed}<br></span>
                                    <span class="monthly-payment">Monthly Payment: 10%<br></span>
                                    <span class="pre-payment">Prepayment privilege: annual lump sum - ${prePaymentFixed}%<br></span>
                                    <span class="pre-payment">Prepayment privilege: increase to regular payment – ${increaseMonthlyPaymentFixed}%<br></span>
                                </p>
                            </div>
                        </td>
                        <td class="collapsible-02 ">
                            <div class="collapsible-wrapper collapse-variable-${mortYears} hide-collapse">
                                <p>
                                    <span class="lender-type">Lender Type: ${lenderTypeVariable}<br></span>
                                    <span class="monthly-payment">Monthly Payment: 10%<br></span>
                                    <span class="pre-payment">Prepayment privilege: annual lump sum - ${prePaymentFixedVariable}%<br></span>
                                    <span class="pre-payment">Prepayment privilege: increase to regular payment – ${increaseMonthlyPaymentVariable}%<br></span>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr class="hide-desktop hide-collapse collapse-${mortYears}-mobile">
                        <td colspan="4" class="hide-collapse collapse-fixed-${mortYears}-mobile">
                            <div>
                                <p class="fixed-header">Fixed Rate</p>
                                <p>
                                    <span class="lender-type">Lender Type: ${lenderTypeFixed}<br></span>
                                    <span class="monthly-payment">Monthly Payment: 10%<br></span>
                                    <span class="pre-payment">Prepayment privilege: annual lump sum - ${prePaymentFixed}%<br></span>
                                    <span class="pre-payment">Prepayment privilege: increase to regular payment – ${increaseMonthlyPaymentFixed}%<br></span>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr class="hide-desktop hide-collapse collapse-${mortYears}-mobile">
                        <td colspan="4" class="hide-collapse collapse-fixed-${mortYears}-mobile">
                            <div>
                                <p class="fixed-header" style="margin-top: 0">Variable Rate</p>
                                <p>
                                    <span class="lender-type">Lender Type: ${lenderTypeVariable}<br></span>
                                    <span class="monthly-payment">Monthly Payment: 10%<br></span>
                                    <span class="pre-payment">Prepayment privilege: annual lump sum - ${prePaymentFixedVariable}%<br></span>
                                    <span class="pre-payment">Prepayment privilege: increase to regular payment – ${increaseMonthlyPaymentVariable}%<br></span>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr class="tr-spacer"></tr>`
        }
        
        return html;
    }

    /**
     * @description get the html element to display each rates
     * @param {float} rate 
     * @returns html element
     */
    function fixedOrVariable(rate) {
        let html = '';

        if (rate > 0) {
            html = `<div class="ProductTableBestMortgageRatesTableCell__StyledProductTableBestMortgageRatesTableCell-sc-crt8yj-0 fkTwJc rh-analytics">
                        <div class="rate-details-container">
                            <div class="rate-cta-container">
                                <button type="button" target="self"
                                    class="PageBehaviourButton__Button-sc-14g1f1v-0 lzOqw rate-cta rh-box-sizing-border-box rh-display-flex rh-border-width-0 rh-p-0 rh-outline-none rh-font-family-gordita rh-fg-blueberry-dark rh-title-l rh-mb-0 weight-medium rh-text-lowercase hover--rh-fg-blueberry focus--rh-fg-blueberry active--rh-fg-blueberry-darkest"
                                    data-name="BMRTable-rate-cta">
                                    <span
                                        class="TextElement__Text-sc-2c9j20-0 ktwbJe text-wrapper">${rate}</span
                                        class="FormattedNumberRaisedSymbol__StyledSymbol-sc-12e4zzh-0 hOlHAA rh-title-xs">%</span></span>
                                </button>
                            </div>
                        </div>
                        <div class="main-cta-container">
                            <button
                                class="application_button Button__Container-sc-1ap9v74-0 gGua-Dl PrimaryButton__StyledButton-sc-19uohmy-0 jAHvHN blueberry-dark rh-fg-coconut hover--rh-bg-blueberry-dark active--rh-bg-blueberry-darkest focus--rh-bg-blueberry-dark hover--rh-border-color-blueberry-dark active--rh-border-color-blueberry-darkest focus--rh-border-color-blueberry-dark rh-box-sizing-border-box rh-width-100p rh-border-radius-8px rh-border-width-2px rh-outline-none weight-medium rh-min-height-2_5 rh-px-1 rh-py-0_5 rh-font-size-s"
                                data-name="BMRTable-main-cta">
                                APPLY
                            </button>
                        </div>
                    </div>`
        }

        return html;
    }
    
    /**
     * @description time the data inserted time in session
     * @param {time} createdTime 
     * @returns 
     */
    function checkTimeCreate(createdTime) {
        let timeNow = new Date();
        let timeCreated = new Date(createdTime);

        let timeDiff = Math.abs(timeNow.getTime() - timeCreated.getTime());
        let diffInHours = timeDiff / (1000 * 60 * 60);

        return diffInHours > 2;
    }


    /**
     * @description click the plus button and trigger the dropdown
     * @param {event} e
     */
    $(document).on('click', '.show-details', (e) => {
        let amortizationRate = 0;
        let years = $(e.currentTarget).parent().attr('data-years');
        let isMobile = false;
        let ex = '';

        if (window.matchMedia("(max-width: 767px)").matches) isMobile = true

        // Toggle Table Row
        if (isMobile) {
            $(`.collapse-${years}-mobile`).toggleClass('hide-collapse')
            ex = '-mobile'
        } else {
            $(`.collapse-${years}`).toggleClass('hide-collapse')
        }

        // Fixed Rate
        let fixedParent = $($(e.currentTarget).parents('tr').children('td.table-cell-rate.rh-px-0_75.rh-py-1')[0]);
        let fixedRate = $(fixedParent.children().children()[0]).children().children().children().text();
        fixedRate = (fixedRate / static.hundred).toFixed(4)

        // Variable Rate
        let variableParent = $($(e.currentTarget).parents('tr').children('td.table-cell-rate.rh-px-0_75.rh-py-1')[1]);
        let variableRate = $(variableParent.children().children()[0]).children().children().children().text();
        variableRate = (variableRate / static.hundred).toFixed(4)

        let mortgageAmount = buyAHome.purchasePrice - buyAHome.downPayment;

        if (transaction == 'buyAhome') {
            if (buyAHome.amortization == '25-year' || buyAHome.amortization == '25-Year') buyAHome.amortization = amortizationYears.TWINTYFIVEYEARS
            if (buyAHome.amortization == 'Less Than 25 Years') buyAHome.amortization = amortizationYears.LESSTHANTWINTYFIVEYEARS
            if (buyAHome.amortization == '30-year' || buyAHome.amortization == '30-Year') buyAHome.amortization = amortizationYears.THIRTYYEARS

            amortizationRate = buyAHome.amortization;
        }

        if (transaction == 'renewing') {
            if (renewSwitch.amortization == '25-year' || renewSwitch.amortization == '25-Year') renewSwitch.amortization = amortizationYears.TWINTYFIVEYEARS
            if (renewSwitch.amortization == 'Less Than 25 Years' || renewSwitch.amortization == 'less than 25 year') renewSwitch.amortization = amortizationYears.LESSTHANTWINTYFIVEYEARS
            if (renewSwitch.amortization == '30-year' || renewSwitch.amortization == '30-Year') renewSwitch.amortization = buyAHome.amortization = amortizationYears.THIRTYYEARS

            amortizationRate = renewSwitch.amortization;
            mortgageAmount = renewSwitch.balance;
        }

        if (transaction == 'refinancing') {
            if (refinance.amortization == '25-year' || refinance.amortization == '25-Year') refinance.amortization = amortizationYears.TWINTYFIVEYEARS
            if (refinance.amortization == 'Less Than 25 Years') refinance.amortization = amortizationYears.LESSTHANTWINTYFIVEYEARS
            if (refinance.amortization == '30-year' || refinance.amortization == '30-Year') refinance.amortization = amortizationYears.THIRTYYEARS

            amortizationRate = refinance.amortization;
            mortgageAmount = refinance.balance + refinance.funds;
        }

        if (fixedRate > 0) {
            let monthlyRate = calcMonthlyPayment(mortgageAmount, fixedRate, amortizationRate, MortgageTypeEnum.FIXED);
            monthlyRate = currency(monthlyRate);
            
            let monthly = $(`.collapse-fixed-${years}${ex} span.monthly-payment`)

            monthly.text(`Monthly Payment: ${monthlyRate}`);
            
            $(`.collapse-fixed-${years}${ex}`).toggleClass('hide-collapse')
        }
        
        if (variableRate > 0) {
            let monthlyRate = calcMonthlyPayment(mortgageAmount, variableRate, amortizationRate, MortgageTypeEnum.VARIABLE);
            monthlyRate = currency(monthlyRate);
            
            let monthly = $(`.collapse-variable-${years}${ex} span.monthly-payment`)

            monthly.text(`Monthly Payment: ${monthlyRate}`);
            
            $(`.collapse-variable-${years}${ex}`).toggleClass('hide-collapse')
        }

        // Toggle + sign
        $(e.currentTarget).children().hasClass('show-details-toggle') ? $(e.currentTarget).children().text('-') : $(e.currentTarget).children().text('+')
        $(e.currentTarget).children().toggleClass('show-details-toggle')
        
    })

    /**
     * @description get all data in air table
     * @param {*} offset 
     * @returns 
     */
    async function fetchRecords(offset) {
        var url = `https://api.airtable.com/v0/appcpYCqsFKWj20MG/ProductMortgageMaster?filterByFormula=STATUS=1&sort%5B0%5D%5Bfield%5D=MORTGAGE_TERMS_YEARS&sort%5B0%5D%5Bdirection%5D=desc&offset=${offset}`;
        
        return await fetch(url, {
            headers: {
            'Authorization': 'Bearer patb5hwKCSoLl2Uuz.175cc452283fcfcd2822b88a5e2317d4baeb33ed589db4fe855e86fb562b0ed3 '
            }
        })
        .then(response => response.json())
        .then(data => {
            allRecords.push(...data.records);

        if (data.offset) {
            return fetchRecords(data.offset);
        } else {
            return allRecords;
        }
        });
    }

    /**
     * @description searching specific rate type
     * @param {mortgageTypes} rateType 
     */
    async function searchRate(rateType, params) {
        let temp = [];
        let useLocal = false;

        foundData = [];

        // Check cache expiration
        if (sessionStorage.getItem('_records')) {
            let oldRecords = JSON.parse(sessionStorage.getItem('_records'));
            
            !checkTimeCreate(oldRecords.time) ? useLocal = true : allRecords = []
        }
        console.log(params)
        if (useLocal) {
            let newRecords = []
            let oldRecords = JSON.parse(sessionStorage.getItem('_records'));

            // Filter by location & check if the rate type is not zero
            oldRecords.record.map(record => {
                let recordField = record.fields
                let provinces = recordField.PROVINCE;

                provinces.forEach(province => {
                    if (province.indexOf(params.province) != -1 && recordField[rateType] > 0 
                    || province.indexOf('ALL') != -1 && recordField[rateType] > 0) {
                        newRecords.push(recordField);
                    }
                })
            
            });

            foundData = getMinimumRate(newRecords, rateType);

        } else {
            await fetchRecords('')
                .then(records => {
                    let newRecords = [];
    
                    records.map(record => {
                        let recordField = record.fields
                        let provinces = JSON.parse(recordField.PROVINCE).province;

                        recordField.PROVINCE = provinces;
                        recordField.BASERATE = (recordField.BASERATE * static.hundred).toFixed(2);
                        recordField.INSURABLERATE = (recordField.INSURABLERATE * static.hundred).toFixed(2);
                        recordField.INSUREDRATE = (recordField.INSUREDRATE * static.hundred).toFixed(2);
                        recordField.RENTALRATE = (recordField.RENTALRATE * static.hundred).toFixed(2);
                        recordField.UNINSUREDRATE = (recordField.UNINSUREDRATE * static.hundred).toFixed(2);
                        recordField.RENTALRATE30Y = (recordField.RENTALRATE30Y * static.hundred).toFixed(2);
                        recordField.UNINSUREDRATE30Y = (recordField.UNINSUREDRATE30Y * static.hundred).toFixed(2);

                        // Filter by location & check if the rate type is not zero
                        provinces.forEach(province => {
                            if (province.indexOf(params.province) != -1 && recordField[rateType] > 0 
                            || province.indexOf('ALL') != -1 && recordField[rateType] > 0) {
                                newRecords.push(recordField);
                            }
                        })
    
                    }).filter(r => r != undefined);

                    foundData = getMinimumRate(newRecords, rateType)

                    let rates = {
                        'time': new Date(),
                        'record': records
                    }
    
                    sessionStorage.setItem('_records', JSON.stringify(rates));
                })
                .catch(error => {
                    console.error(error);
                });
                
        }

        const result = Object.groupBy(foundData, ({ MORTGAGE_TERMS_YEARS }) => MORTGAGE_TERMS_YEARS);

        Object.keys(result).sort().reverse().forEach(d => {
            temp.push(result[d])
        });

        return temp;
    }

    /**
     * @description get the best rates
     * @param {Array} rates 
     * @param {mortgageTypes} rateType 
     */
    function getMinimumRate(rates, rateType) {
        const result = Object.groupBy(rates, ({ MORTGAGE_TERMS_YEARS }) => MORTGAGE_TERMS_YEARS);
        let minRates = [];
        let mortgageTypes = ['Fixed', 'Variable'];

        mortgageTypes.forEach( type => {
            for (var i = 1; i <= 5; i++) {
                let filteredRates = result[i].map(record => {
                    if (record.MORTGAGETYPE == type) {
                        return record;
                    }
                })
                .filter(record => record != undefined);

                var lowest = Number.POSITIVE_INFINITY;
                var temp;
                var minRate;
    
                for (var j = filteredRates.length - 1; j >= 0; j--) {
                    temp = filteredRates[j][rateType];
    
                    if (temp < lowest) {
                        minRate = filteredRates[j];
                        lowest = temp;
                    }
                }
    
                if (minRate != undefined) {
                    minRates.push(minRate)
                }
            }

        })

        return minRates;
    }
    
    let token = ''
    /**
     * @description check the URL parameters
     */
    async function getURLParameters() {
        let search = new URLSearchParams(window.location.search);
        let purpose = 'owner-occupied';
        let province = 'ALL';
        let purchase = buyAHome.purchasePrice;
        let mortgage = renewSwitch.balance;
        transaction = 'buy-a-home'

        if (search.has('property-tran-type')) {
            transaction = search.get('property-tran-type') != '' ? search.get('property-tran-type') : transaction;
        }

        if (search.has('property-purpose')) {
            if (search.get('property-purpose') == 'owner-occupied') {
                purpose = 'Owner-occupied'
                $('#occupancy-item-0').click();
            }
            if (search.get('property-purpose') == 'owner-occupied-with-rental') {
                purpose = 'Owner-occupied With Rental'
                $('#occupancy-item-1').click();
            }
            if (search.get('property-purpose') == 'rental') {
                purpose = 'Rental'
                $('#occupancy-item-2').click();
            }
            if (search.get('property-purpose') == 'second-home') {
                purpose = 'Second Home'
                $('#occupancy-item-3').click();
            }
        }
        
        if (localStorage.getItem('_current_location')) {
            province = JSON.parse(localStorage.getItem('_current_location'));
            province = province.abbreviation
            
            console.log(province)
        }

        if (search.has('property-province')) {
            province = search.get('property-province') != '' ? search.get('property-province') : province;

            if (province != 'ALL') {
                $(`#${province}`).click();
            }
        }

        if (search.has('property-purchaseamount')) {
            purchase = search.get('property-purchaseamount') != '' ? search.get('property-purchaseamount') : purchase;
        }

        if (search.has('property-mortgageamount')) {
            mortgage = search.get('property-mortgageamount') != '' ? search.get('property-mortgageamount') : mortgage;
        }

        if (search.has('partner-id')) {
            let queryString = window.location.href
            const params = new URLSearchParams(queryString);
           
            params.delete('property-purpose');
            params.delete('property-province');
            params.delete('property-mortgageamount');
            params.delete('property-purchaseamount');

            const updatedQueryString = params.toString();
            const decode = decodeURIComponent(updatedQueryString);
            
            const getPartnerId = decode.split('?')[1];
            const getPartnerIdValue = getPartnerId.split('partner-id=')[1];
            const result = getPartnerIdValue.replace(/=&/g, '&');
            const value = result.replace(/=$/, '');
            
            token = value
        }

        if (transaction == 'buy-a-home') {
            buyAHome.purpose = purpose;
            buyAHome.province = province;
            buyAHome.purchasePrice = parseInt(purchase);

            $('#homePrice').val(currency(buyAHome.purchasePrice))
            $('#scenario-item-0').click()

        } else if (transaction == 'renewal') {
            renewSwitch.purpose = purpose;
            renewSwitch.province = province;
            renewSwitch.balance = parseInt(mortgage);

            $('#renewMortgageBalance').val(currency(renewSwitch.balance))
            $('#scenario-item-1').click()

        } else if (transaction == 'refinance') {
            refinance.purpose = purpose;
            refinance.province = province;
            refinance.balance = parseInt(mortgage);

            $('#renewMortgageBalance').val(currency(renewSwitch.balance))
            $('#scenario-item-2').click()
        } else {
            callTheApi();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const IframeToken = urlParams.get('token');

        if (IframeToken) {
            await fetch(`/api/iframe-css`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'token': IframeToken
                })
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)

                $('.header-wrapper .header').css({
                    'color': res.headerText.color,
                    'font-size': res.headerText['font-size']
                });

                $('.IZujl').css('background-color', res.inputBody['background-color'])
                $('.hsBczI > .select-combobox > .select-open-menu-button > .icon-chevron').css('stroke', res.inputBody['background-color']);

                $('th.table-header-cell.rh-text-s.weight-regular.rh-fg-stone-darkest.rh-text-align-left.rh-px-0_75.rh-py-0_25').css({
                    'color': res.tableHeading.color,
                    'font-size': `${res.tableHeading['font-size']}px`,
                });

                $('.rh-fg-blueberry-dark').attr('style', `color:${res.ratings.rateColor}`)
                $('.gGua-Dl').css({
                    'background-color': res.ratings['btnBackground'],
                    'color': res.ratings.color
                });

                $('.rh-text-m').css('color', res.inputBody.color)

            }).catch(er => console.log(er))
        }
        setTimeout(() => {
            $('#loader').hide()
        }, 1000);
    }
    
    // Trigger the first load
    getURLParameters();

    // Disable submit functionalities
    $('form').submit((e) => e.preventDefault());
    
    // Disable Enter Functionalities
    $('input[inputMode="numeric"], input[inputMode="decimal"]').keypress(function (event) {
        if (event.keyCode === 10 || event.keyCode === 13) {
            event.preventDefault();
        }
    });

    /**
     * @description trigger the apply button
     */
    $(document).on('click', '.application_button', (e) => {
        let url = 'https://borrower.frankmortgage.com/auth/register';
        
        if (token) {
            url += `?partner_token=${token}`;
        }

        window.open(url, '_blank').focus();
    })
})