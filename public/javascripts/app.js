(function ($) {
    $('.input1').fadeIn(400).find('input').focus();
    // Variables
    var offsets = {
        left: $(window).width(),
        top: $(window).height()
    };  // get the client's window size

    var submi = $('.submits'),
        submiAge = $('.submitsAge'),
        appe = $('.appended'),
        name,
        gender,
        sname,
        age,
        male = $('.male'),
        female = $('.female'),
        users;  // Get the information from the server about the users and age selected

    // Define the area of each step
    $('.area').css('width', offsets.left).css('height', offsets.top);

    // Step Functions

    var step1 = function () {
        $('.input2').fadeIn(400).find('h2').show(200);
        $.ajax({
            url: "/name",
            type: "get",
            data: { name: name },
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
                sname = $.parseJSON(data);
                var data = [                          // Dounut chart info
                    {value: sname.name, color: "#F7464A" },
                    { value: sname.total, color: "#4D5360" }
                ],
                ctx = $("#chart").get(0).getContext("2d"),
                theChart = new Chart(ctx).Doughnut(data);      // Initialize Dounut chart
            }
        });

        $('.login').slideDown();
        $('.input1').animate({ 'margin-top': -offsets.top }, 1000, 'swing', function () {
            $('.input2').find('h3').fadeIn(700, function () {
                $('.input2 h3').find('span').delay(300).fadeIn(500, function () {
                    $('#chart').animate({ 'left': -300 }, 500, 'swing', function () {
                        $('.canva1p').show().html(Math.round(sname.name * 100 / sname.total) + ' % of our users are called ' + name).animate({ 'top': 185 }, 400, function () {
                            $('.canva1a').css('top', 110).fadeIn(1000).css('dispay', 'block');
                        });
                    });
                });
            });
        });
    }

    var step2 = function () {
        $('.input2').animate({ 'margin-top': -offsets.top }, 1000, 'swing', function () {
            $.ajax({
                url: "/a/" + age,
                type: "get",
                success: function (data) {
                    console.log(data);
                    users = $.parseJSON(data);
                    var ageData = [          // Age chart data
	                    {
	                    value: users.male,
	                    color: "#36B9B2"
	                },
	                    {
	                        value: users.female,
	                        color: "#EBA087"
	                    }
                    ],
                    ageCtx = $("#ageChart").get(0).getContext("2d"),
                    ageChart = new Chart(ageCtx).Pie(ageData);          // Initialize age chart
                }
            });

            $('.input3').fadeIn(400).find('.gender').fadeIn(500);


        });
    }

    var step3 = function () {
        $('.input3').animate({ 'margin-top': -offsets.top }, 1000, 'swing', function () {
            $('.input4').fadeIn(400).find('h2').fadeIn(700, function () {
                $('.input4 h2').find('span').delay(300).fadeIn(700, function () {
                    $('.input4').find('h3').delay(400).slideDown(500, function () {
                        $('.register').animate({ 'bottom': 200 }, 700);
                    });
                });
            });
        });
    }

    // Get name function
    $('.appender').on('keyup', function (event) {
        name = $(this).val();  // Register the value typed
        appe.html(name); // append the value to the top bar
        $('.appended2').html(name);  // append the value to the greeting step2

        // Deals with the submit button with validation keyCodes
        if (event.keyCode >= 48 && event.keyCode <= 90) {
            submi.fadeIn().css('display', 'block');
        }
        if (!name) {
            submi.fadeOut();
        }

        // Relates the step1 function to the enter key and button click
        submi.on('click', function () {
            step1();
        });
        if (event.keyCode == 13) {
            step1();
        }
    });

    // Age input functionality
    $('.appenderAge input').on('keyup', function (event) {
        // Validate input keys with Enter
        if (event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 8 || event.keyCode == 13) {
            // Validate without enter
            if (event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 8) {
                age = $(this).val(); // Get the value typed
                age = age.substring(0, 2);
                $(this).val(age);
                submiAge.fadeIn(350).css('display', 'block').css('margin-bottom', 15); // makes the input button appear
                $('.appenderAge').animate({ 'height': 165 }); // Animate the page to make space for the submit button
                appe.html(name + ', ' + age + ' yrs'); // append value to the top bar
                if (!age) {
                    submiAge.fadeOut();
                    $('.appenderAge').animate({ 'height': 90 });
                }
            }
            // Makes the input butto desapear
            if ($.isNumeric(age)) {
                if (event.keyCode == 13) {
                    step2();
                }
            }

            // Execute action to step2 both with enter key and button click
            submiAge.on('click', function () {
                step2();
            });


        } else {
            $(this).val("");
            if (event.keyCode >= 48 && event.keyCode <= 90) {
                $('.errAge').show(300, function () {
                    $(this).delay(1000).hide(300);
                });
            }
        }
    });

    // Makes the age input appear
    $('.canva1a').on('click', function () {
        $('.appenderAge').animate({ 'height': 90 }).slideDown(300);
        $('.canva1a').fadeOut();
    });

    // Creates functionality for both male and female click functions and proceeds to next step
    male.on('click', function () {
        gender = "male";
        appe.html(name + ', male, ' + age + ' yrs');
        female.addClass('grayed');
        $('#ageChart').animate({ 'bottom': offsets.top / 2, 'left': offsets.left / 2 }, function () {
            $('.input3').find('h3').html('Right now we have ' + users.male + " other men in our site").fadeIn(800, function () {
                $('.input3').find('h4').html("and " + Math.round(users.ageNum * 100 / users.total) + '% of our users are also ' + age + ' yrs old').fadeIn(800, function () {
                    $('.canva2a').css('top', '82%').fadeIn(1000).css('dispay', 'block');
                });
            });
        });
    });
    female.on('click', function () {
        gender = "female";
        appe.html(name + ', female, ' + +age + ' yrs');
        male.addClass('grayed');
        $('#ageChart').animate({ 'bottom': offsets.top / 2, 'left': offsets.left / 2 }, function () {
            $('.input3').find('h3').html('Right now we have ' + users.female + " other women in our site").fadeIn(800, function () {
                $('.input3').find('h4').html("and " + Math.round(users.ageNum * 100 / users.total) + '% of our users are also ' + age + ' yrs old').fadeIn(800, function () {
                    $('.canva2a').css('top', '80%').fadeIn(1000).css('dispay', 'block');
                });
            });
        });
    });
    // Last step to proceed to the register landing page
    $('.canva2a').on('click', function () {
        step3();
    });
    // Show register modal
    $('.register').on('click', function () {
        $('#fname').val(name);
        $('#gender').val(gender);
        $('.input5').slideDown(600);
    });

})(jQuery);