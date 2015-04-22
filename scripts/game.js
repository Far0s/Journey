// World Parameters object
var worldParams = {  /* NB : world, perso, level and difficulty are defined in the HTML before the game */
	world: 1,  // Can be equal to 1, 2, 3 or 4 (default = 1)
	perso: 1,  // Can be equal to 1, 2, 3 or 4 (default = 1)
	score: 0,  // Score (default = 0)
	level: 100,  // Objective (default = easier)
	difficulty: 12,  // Difficulty level (default = easier)
}

// General gameplay vars
var arrowSpace = 32;  // SPACE keycode
var arrowTop = 38;  // UP ARROW keycode
var arrowBottom = 40;  // DOWN ARROW keycode
var arrowShift = 16;  // SHIFT keycode
var keyEscape = 27;  // ESCAPE keycode
var keyS = 83;  // S keycode — used for jump-start running animation
var groundRepetition;  // For background repetition
var vitesseGround = 250;  // Ground speed based on level (+ lag is adjusted automatically)
var levelLength = 10;  // Game width measured in ground blocks
var intervalGame = function () {};  // Interval initialized for ground scrolling
var intervalBackground = function () {};  // Interval initialized for background scrolling	
var compteurGeneration = {  // Used to add new ground blocks whenever conditions are true
	value: 0,
	add: function () { this.value++; },
	reset: function () { this.value = 0; },
	get: function () { return this.value; }
};

// Background scrolling vars
var bgScrollVars = {
	speed: 50,  // Speed in milliseconds
	current: 0,  // Set the default position
	direction: 'h'  // Set the direction ('h' or 'v')
}

// World selection funtion (background + ground textures)
$('.worldselect').click(function(event) {
	$('.parallax-layer').css('background','url("img/worlds/bgScene'+ worldParams.world +'.png")');
	$('.ground').css('background','url("img/grounds/ground'+ worldParams.world +'.png")');
});

// Character selection function
$('.persoselect').click(function(event) {
	$('#perso').css('background', 'url("img/perso'+ worldParams.perso +'.png")');
});

// Game starting function (which essentially includes all the game mechanics)
function gameStart() {
	$('#game').css('display','block');  // Shows the game
	$('#site').css('display','none');  // Hides the site
	$('header').append('<audio id="player" src="sounds/rof.mp3" autoplay loop>Veuillez mettre à jour votre navigateur !</audio>');  // Starts the music

	// Run animation
	jQuery.fn.marcheDrt = function() {
		$(this).oneTime(100,function() {
			$(this).css({backgroundPosition:'0px 0px'});
		}).oneTime(200,function() {
			$(this).css({backgroundPosition:'-267px 0px'});
	   }).oneTime(300,function() {
			$(this).css({backgroundPosition:'-133px 0px'});
		}).oneTime(400,function() {
			$(this).css({backgroundPosition:'-399px 0px'});
		});
	};

	// Repetition of Run animation 
	jQuery.fn.mouvMarcheDrt = function(){
		$(this).marcheDrt();
		$(this).everyTime(400,function(){
			$(this).marcheDrt();
		});
	};

	// Jump animation and Run resuming
	var jumping = false;
	jQuery.fn.marcheTop = function() {
		if(!jumping){
			jumping = true;
			$(this).css({backgroundPosition:'-528px 0px'}).animate({ "bottom": "+=300px" }, 700 );
  			$(this).css({backgroundPosition:'-660px 0px'}).animate({ "bottom": "-=300px" }, 950 , function () {
  				$("#perso").stopTime().mouvMarcheDrt();
  			});
  			setTimeout(land, 1301);
  			function land() {
				jumping = false;
			}
		}
	};	
	
	$(document).ready(function() {  // Start and jump-start function, also pause/resume function (broken at the moment)
		var arret = 0;
		$(document).on('keydown', function (touche) {
			var appui = touche.keyCode;
	    	if(appui == 83) { // si le code de la touche est égal à 83 (S)
	        	if (arret == 1) {
					arret = 0;
				} else {
					$("#perso").stopTime().mouvMarcheDrt();
				}
	    	} else if(appui == 38){ // si le code de la touche est égal à 38 (ESPACE)
	    		if (arret == 1) {
					arret = 0;
				} else {
					$("#perso").stopTime().marcheTop();
				}
	    	}
		});

		// Background scrolling function
		function bgscroll(){
		    bgScrollVars.current -= 1; // 1 pixel row at a time
		    $('.parallax-layer').css("backgroundPosition", (bgScrollVars.direction == 'h') ? bgScrollVars.current+"px 0" : "0 " + bgScrollVars.current+"px");  // move the background with backgrond-position css properties
		}

		function createGround() {
			// On divise la width de l'écran par la width des blocs pour savoir combien il faut de blocs pour remplir l'écran avec une marge de 2 blocs
			levelLength = Math.ceil($(window).width() / 100) + 2;
			for (var i=0; i<levelLength; i++) {
				var translateX = i * 100; // La position du block (le numero * sa width)
				$("#grounds").append('<div class="ground" style="left: '+ translateX +'px"><img border="0" alt="animated ground" src="img/grounds/ground'+ worldParams.world +'.png" /></div>');
			};
			// On recupere les enfants de #grounds soit chaque bloc .ground
			grounds = $('#grounds').children();
			// On lance le defilement des blocs
			intervalGame = setInterval(loop, vitesseGround);
			// On scroll le background
			intervalBackground = setInterval(bgscroll, bgScrollVars.speed);
		};
		createGround();

		// Rafraichit la position de chaque bloc
	  	function loop() {
	  		// On parcourt chaque bloc
	  		grounds.each(function () {
	  			// On modifie la position de chaque bloc
	  			$(this).animate({
	            	left: parseInt($(this).css('left')) - 100 +"px"
	        	}, (vitesseGround-20), 'linear', function () {
	        		// Quand un bloc sort de l'écran on le repositionne a la fin
	        		if ((parseInt($(this).css('left')) + 100) <= 0) {
	        			$(this).css('left', (parseInt($(window).width()) + 100) +"px");
	        			compteurGeneration.add();
	        		}

	        		// Tous les 10 blocs
	        		if (compteurGeneration.get() == worldParams.difficulty) {
	        			// Code a executer
	        			// var aleaDegree = Math.round(Math.random()*5); // Determine le délai avant qu'un obstacle soit ajouté
	        			var levelLength = Math.ceil($(window).width() / 100) + 2;
	        			var i=0; i<levelLength; i++;
						var translateX = i * 120; 
	        			// récupérer la position de ce bloc pour ajouter un bloc html '.obstacle'
						$("#obstacles").delay((Math.round(Math.random()*5))*1000).append('<div data-hitbox="true" class="obstacle" id="obsActive" style="bottom: '+ translateX +'px"><img border="0" alt="animated obstacle" src="img/obstacles/obstacle'+ worldParams.world +'.png" /></div>');
	        			$('.obstacle').animate({
	        				right: parseInt($(this).css('left')) - 100 +"px"
	        			}, (vitesseGround*10), 'linear');
	        			if($('#obsActive').css('right') >$(window).width()) {
	        				$('.obstacle #obsActive').removeAttr('id');
	        			}
	        			compteurGeneration.reset();
	        		}
	        	});
	  		});
	    }

	    // When tab/window is not active, JS execution pauses
		(function() {
	    	var time = 999999999, // temps de jeu à définir en ms
	        	delta = 50,
	        	tid;
	    	tid = setInterval(function() {
	        	if ( window.blurred ) { 
	        		$('.overlay').removeClass('hidden');
	        		clearInterval(intervalGame);
					clearInterval(intervalBackground);
	        		return; 
	        	}

	        	time -= delta;
	        	if ( time <= 0 ) {
	            	clearInterval(tid);
	        	}
	    	}, delta);
		})();
		window.onblur = function() { window.blurred = true; };
		window.onfocus = function() { window.blurred = false; };
		$('.overlay').addClass('hidden');
		$(document).ready(function() {
			$(document).keyup(function(touche){
		    	var appui = touche.which || touche.keyCode;
		    	if (appui == 32){
		        	if ($('.overlay').hasClass('hidden')){
						$('.overlay').removeClass('hidden');
						clearInterval(intervalGame);
						clearInterval(intervalBackground);
					} else {
						$('.overlay').addClass('hidden');
						loop();
						bgscroll();
						intervalGame = setInterval(loop, vitesseGround);
						intervalBackground = setInterval(bgscroll, bgScrollVars.speed);
						$("#perso").stopTime().mouvMarcheDrt();
					} 
					event.stopImmediatePropagation();
		    	} 
		    })
		});
	});
	$("#perso").stopTime().mouvMarcheDrt();
} // END of gameStart()


var etatPerso = true;
function hitboxCheck() {
	var perso = $('#perso');
	var persoHitbox = {
		height: 200,
		width: 128,
		bottom: parseInt(perso.css('bottom')),
		left: 200,
		right: 328,
	};
	var obs = $('#obsActive');
	var obsHitbox = {
		height: 130,
		width: 72,
		bottom: 110,
		top: 240,
		right: parseInt(obs.css('right')),
		left: $(window).width() - 72 - parseInt(obs.css('right')),
	};
	if(obsHitbox.left <= persoHitbox.right && obsHitbox.right >= persoHitbox.left){
		if(persoHitbox.bottom <= obsHitbox.top) {  // Rajouter code de fin de jeu ici !
			var etatPerso = false;
			window.location.href = "dead.html";
		} else {  // Code executed in case of dodge
			obs.removeAttr('id');
			worldParams.score = worldParams.score+10;
			$("#scoreCounter").text(worldParams.score +' / '+ worldParams.level);
			// Victory condition and events
			if (worldParams.score >= worldParams.level) {
				window.location.href = "victoires/victoire"+ worldParams.world +".html";
			};
		}
	}
	hitTimer = setTimeout(hitboxCheck, 500);
}
hitboxCheck();

// Game restart function
function gameRestart() {
	location.reload();
}