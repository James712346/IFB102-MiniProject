var oscillator;

var ws = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws');

var sides = [0,1];
var sides_titles = ["Volume", "Frequancy"];


var Dranges = [[0,200],[0,200]];
var Vranges = [[0,100],[27.5, 4186]];

var ChangeRate = $("#global .ramp").val();

var html = [$("#left .Variable").html(), $("#right .Variable").html()];
$('#stop').hide()
$("#swap").click(function() {
                 sides.reverse();
                 $("#left h1").html(sides_titles[sides[0]]);
                 $("#left .Variable").html(html[sides[0]]);
                 $("#right h1").html(sides_titles[sides[1]]);
                 $("#right .Variable").html(html[sides[1]]);
});

$("#play").click(function() {
  console.log($('#global').validate())
  if ($("#global").valid()) {
  var ChangeRate = $("#global .ramp").val();
	var context = new AudioContext();
	if (Tone.context.state !== 'running') {
        Tone.context.resume();
  }
  $('#play').hide();
  $('#stop').show();
	oscillator = new Tone.Oscillator({"frequency" : 440, "type" : $("#type").val(),"volume" : 1,"detune" : Math.random() * 30 - 15}).toMaster();
  oscillator.start();
  ws.onmessage = function (event) {
       data = JSON.parse(event.data);
       //percentage of Distance to Max Distance times range of the Frequancy
       freq = (((parseFloat(data[sides[1]])-Dranges[sides[1]][0])/Dranges[sides[1]][1]) * (Vranges[1][1] - Vranges[1][0])) + Vranges[1][0];
       volume = (((parseFloat(data[sides[0]])-Dranges[sides[0]][0])/Dranges[sides[0]][1])*(Vranges[0][1] - Vranges[0][0])) + Vranges[0][0];//give a percentage of how intense the note will be
       freq = parseFloat(freq).toFixed(2)
       volume = parseInt(volume)
       console.log("Freq = "+ freq);
       console.log("Volume = "+ volume);
       oscillator.frequency.rampTo(freq, )
       oscillator.volume.rampTo(volume, ChangeRate)
		 }
   }
});
$('#stop').click(function() {
  $('#stop').hide()
  $('#play').show()
  ws.onmessage = undefined
  oscillator.volume.rampTo(-Infinity, 1);
  oscillator = undefined
});
$('#global').submit(function(e) {
    e.preventDefault();
});

$('#left').submit(function(e) {
    e.preventDefault();
    Dranges[0] = [$("#Lmin").val(), $("#Lmax").val() ] ;
    Vranges[sides[0]] = [$("#left .Variable .min").val(), $("#left .Variable .max").val()];
    console.log(Dranges, Vranges)
});
$('#right').submit(function(e) {
    e.preventDefault();
    Dranges[1] = [$("#Rmin").val(), $("#Rmax").val() ] ;
    Vranges[sides[1]] = [$("#right .Variable .min").val(), $("#right .Variable .max").val()];
  console.log(Dranges, Vranges)
});
