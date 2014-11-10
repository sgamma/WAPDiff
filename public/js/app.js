'use strict';
function cardflip() {
  $.each($("div.containerCard"), function(i, element) {
    TweenMax.set($(this), {css:{
      transformStyle:"preserve-3d",
      z:0
    }});

    var frontCard = $(this).children(".frontCard"),
        backCard = $(this).children(".backCard");

    TweenMax.set(backCard, {css:{
      position:"absolute",
      top:0,
      rotationY:-180
    }});

    TweenMax.set([frontCard, backCard], {css:{
      backfaceVisibility:"hidden"
    }})

    var tl = new TimelineMax({paused:true});
    tl
      .to(frontCard, 1, {rotationY:180})
      .to(backCard, 1, {rotationY:0},0)
      .to(element, .5, {z:50},0)
      .to(element, .5, {z:0},.5);

    element.animation = tl;
    $(this).find(".btnflip").click(flip);
  });
}

function flip(e) {
    var card = e.target.parentNode.parentNode.parentNode;
    card.animation.play();
}

function setup() {
  $("a[data-toggle='tooltip']").tooltip();
  cardflip();
}

setup();
