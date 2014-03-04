var offsets = $('.bottom').offset();
$('.area').css('width', offsets.left).css('height', offsets.top);
var submi = $('.submits');
var submiAge = $('.submitsAge');
var appe = $('.appended');
var name;
var age;

$('.appender').on('keyup', function (event) {
    name = $(this).val();
    appe.html(name);
    $('.appended2').html(name);
    submi.fadeIn().css('display', 'block');
    if (!name) {
        submi.fadeOut();
    }

    var step1 = function () {
        $('.login').slideDown();
        $('.input1').animate({ 'margin-top': -offsets.top }, 1000, 'swing', function () {
            $('.input2 h3').fadeIn(1500, function () {
                $('.input2 h3 span').delay(500).fadeIn(500, function () {
                    $('#chart').animate({ 'left': -300 }, 500, 'swing', function () {
                        $('.canva1p').show().html('4% of our users are called ' + name).animate({ 'top': 185 }, 400, function () {
                            $('.canva1a').css('top', 110).fadeIn(1000).css('dispay', 'block');
                        });
                    });
                });
            });
        });
    }

    $('.canva1a').on('click', function () {
        $('.appenderAge').animate({ 'height': 90 }).slideDown(300);
        $('.canva1a').fadeOut();
    });


    submi.on('click', function () {
        step1();
    });
    if (event.keyCode == 13) {
        step1();
    }
});
$('.appenderAge input').on('keyup', function(event){
    age = $(this).val();
    $('.appenderAge').animate({'height': 165});
    appe.html(name + ', ' + age + ' yrs');
    submiAge.fadeIn(350).css('display', 'block').css('margin-bottom', 15);
    if(!age){
        submiAge.fadeOut();
        $('.appenderAge').animate({'height': 90});
    }

    var step2 = function(){
        $('.input2').animate({'margin-top': -offsets.top}, 1000, 'swing', function(){
            $('.gender').fadeIn(500);
        });
    }

    submiAge.on('click', function(){
        step2();
    });
    if(event.keyCode == 13){
        step2();
    }
});

var male = $('.male'),
    female = $('.female'),
    users = { total: 7580, male: 4343, female: 3242, ageNum: 322 };

male.on('click', function () {
    appe.html(name + ', male, ' + +age + ' yrs');
    female.addClass('grayed');
    $('#ageChart').animate({'bottom': offsets.top / 2,'left': offsets.left / 2}, function(){
        $('.input3 h3').fadeIn(600).html(users.male + " other men in our site", function () {
            $('.ageStats').fadeIn().after(age + ' yrs old');
        });
    });
});
female.on('click', function () {
    appe.html(name + ', female, ' + +age + ' yrs');
    male.addClass('grayed');
    $('#ageChart').animate({ 'bottom': offsets.top / 2, 'left': offsets.left / 2 }, function () {
        $('.input3 h3').html('Right now we have ' + users.female + " other women in our site").fadeIn(800, function () {
            $('.input3 h4').html("and "+ Math.round(users.ageNum * 100 / users.total) + '% of them are also' + age + ' yrs old').fadeIn(800);
        });
    });
});


var data = [
    {value: 4, color: "#F7464A"},
    {value: 96, color: "#4D5360"}
];
var options = {animation: true}
var ctx = $("#chart").get(0).getContext("2d");
var theChart = new Chart(ctx).Doughnut(data,options);

var ageData = [
	{
	    value: 4343,
	    color: "#36B9B2"
	},
	{
	    value: 3242,
	    color: "#EBA087"
	}
];
var ageCtx = $("#ageChart").get(0).getContext("2d");
var ageChart = new Chart(ageCtx).Pie(ageData);