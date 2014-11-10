'use strict';
function cardflip() {
  $.each($("div.containerCard"), function(i, element) {
    TweenMax.set($(this), {css:{
        transformStyle:"preserve-3d",
        z:0
      }
    });

    var frontCard = $(this).children(".frontCard"),
        backCard = $(this).children(".backCard");

    TweenMax.set(backCard, {css:{
      position:"absolute",
      top:0,
      width: "100%",
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
    var eventData = {
        rep  : $(element).attr('data-rep'),
        file : $(element).attr('data-file')
    }
    $(this).find(".btnflip").on('click', eventData, flip);
  });
}

function flip(e) {
  var card = e.target.parentNode.parentNode.parentNode;
  card.animation.play();
  $.ajax({
    type: "POST",
    url: '/sync/'+e.data.rep+'/'+e.data.file,
    data: {},
    success: function(data) {
      console.log("Sync successfull");
      setFrontCardOk(e.target.parentNode.parentNode);
    },
    dataType: 'JSON'
  }).fail(function(data){
    console.log("ERRORE: " + data.error);
    //setup error message
  }).always(function(data){
    card.animation.reverse();
  });
}

function setFrontCardOk(frontCard) {
  $(frontCard).children().remove();
  $(frontCard)
    .addClass('text-success')
    .append($('<span>').addClass('glyphicon glyphicon-thumbs-up'));
}

function setup() {
  //$("button[data-toggle='tooltip']").tooltip();
  cardflip();
}

setup();
