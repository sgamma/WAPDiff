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
        fid  : $(element).attr('data-fid'),
        mfid : $(element).attr('data-mfid')
    }
    $(this).find(".btnflip").off('click').on('click', eventData, flip);
  });
}

function flip(e) {
  e.preventDefault();
  var card = e.target.parentNode.parentNode.parentNode;
  card.animation.play();
  setTimeout(function(){
    $.ajax({
      type: "POST",
      url: '/sync',
      data: {
        fid: e.data.fid,
        mfid: e.data.mfid
      },
      dataType: 'JSON'
    }).done(function(data){
       if ( data.result ) {
          console.log("Sync successfull");
          setFrontCardOk(e.target.parentNode.parentNode);
        } else {
          console.log("Sync failed: " + data.error.userMessage);
          setFrontCardError(e.target.parentNode.parentNode, data.error.userMessage);
        }
    }).fail(function(data){
      setFrontCardError(e.target.parentNode.parentNode, data.error.userMessage || 'Errore imprevisto');
    }).always(function(data){
      card.animation.reverse();
    });
  }, 1000);
}

function setFrontCardOk(frontCard) {
  var $fc = $(frontCard);
  $fc.children().remove();
  $fc
    .addClass('text-success')
    .append($('<span>').addClass('glyphicon glyphicon-thumbs-up'));
}

function setFrontCardError(frontCard, errMsg) {
  var $fc = $(frontCard);
  var $spanError = $('<span>').addClass('text-danger').text(errMsg);
  $fc
    .find('.btnflip')
    .replaceWith($spanError);
}

function setup() {
  cardflip();
}

setup();
