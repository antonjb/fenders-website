$(document).ready(function(){$(".hamburger").click(function(){return $(".mob-menu").css({height:$(document).height()}),$("body").hasClass("is-mobOpen")?$("body").removeClass("is-mobOpen"):$("body").addClass("is-mobOpen"),!1})});