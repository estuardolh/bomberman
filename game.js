var level1;
var hero;

var w = 17, h = 9;
var block;

engine.load = function(){
	engine.image.load("./images/ladrillo1.png", "ladrillo1");
	engine.image.load("./images/ladrillo2.png", "ladrillo2");
	engine.image.load("./images/ladrillo3.png", "ladrillo3");
	engine.image.load("./images/ladrillo4.png", "ladrillo4");
	engine.image.load("./images/bomberman.png", "bomberman");
	engine.image.load("./images/bomberman_right.png", "bomberman_right");
	engine.image.load("./images/bomberman_front.png", "bomberman_front");
	engine.image.load("./images/bomb.png", "bomb");
	engine.image.load("./images/bomb1.png", "bomb1");

	level1 = new engine.map( "level1", w, h );

	var i = 0;
	var j = 0;
	for( ; i < w ; i++ ){
		for( ; j < h ; j++ ){
			var key = ( i % 2 ? "ladrillo1" : "ladrillo2" );
			if( j > 0 && j < h - 1 ){
				key = ( j % 2 ? "ladrillo1" : "ladrillo2" );
			}
			
			if( ( i == 0 || i == w - 1 ) || ( j == 0 || j == h - 1 ) ){
				block = new engine.entity( key , i * 32 , j * 32 );
				block.tag = "block_indestructible";
				
				level1.push( block );
			}else{
				if( i == 1 && j == 1 ){
					hero = new engine.entity( "bomberman_front", 33, 33 );
					hero.w = 26;
					hero.h = 30;
					hero.acceleration = 0.98;
				}else{
					if( Math.random() < 0.4 ){
						block = new engine.entity( "ladrillo4" , i * 32 , j * 32 );
						block.tag = "block_destroyable"
						
						level1.push( block );
					}else{
						//block = new engine.entity( "ladrillo3" , i * 32 , j * 32 );
						//block.tag = "block_ground";
					}
				}
			}
			
			//level1.push( block );
		}
		j = 0;
	}
	hero.bomb_count = 0;
	hero.bomb_alive = false;
	hero.daBomb = function(){
		if( hero.bomb_alive == false ){
			hero.bomb_alive = true
			
			var seconds_delay = 4 ;
			
			var bomb = new engine.entity("bomb", 0, 0);
			bomb.tag = "bomb";
			bomb.x = hero.x ;
			bomb.y = hero.y ;
			bomb.addFrame( "bomb", 500 );
			bomb.addFrame( "bomb1", 500 );
			bomb.explode = function(){
				bomb.visible = false;
				
				// destroy blocks
				level1.entity_list.forEach(
					function( entity ){
						// get block from top
						var block_top = level1.getAt( bomb.x, bomb.y - 32 );
						// get block from bottom
						var block_bottom = level1.getAt( bomb.x, bomb.y + 32 );
						// get block from left
						var block_left = level1.getAt( bomb.x - 32, bomb.y );
						// get block from right
						var block_right = level1.getAt( bomb.x + 32, bomb.y );
						
						// hide them
						if( block_top != null && block_top.tag == "block_destroyable" ){
							block_top.visible = false;
						}
						if( block_bottom != null && block_bottom.tag == "block_destroyable" ){
							block_bottom.visible = false;
						}
						if( block_left != null && block_left.tag == "block_destroyable" ){
							block_left.visible = false;
						}
						if( block_right != null && block_right.tag == "block_destroyable" ){
							block_right.visible = false;
						}
					}
				);
			};
			bomb.detonate = function(){
				setTimeout( function(){ 
						bomb.explode(); 
						engine.msg("explode!"); 
						hero.bomb_alive = false; 
					}, seconds_delay * 1000 );
			};
			
			bomb.detonate();
			
			level1.push( bomb );
		}
	};
	
	engine.current_map = level1;
	
	engine.viewport.enabled = true;
	engine.viewport.width = 300;
	engine.viewport.height = 300;
};

engine.draw = function(){
	engine.current_map.draw();
	hero.draw();
};
engine.update = function(){
	var hero_dx = 0.5, hero_dy = 0.5;
	var dx = 0, dy = 0;
	
	if( engine.events.iskeydown("down") ){
		dy = hero_dy;
		dx = 0;
	}
	if( engine.events.iskeydown("up") ){
		dy = -hero_dy;
		dx = 0;
	}
	if( engine.events.iskeydown("right") ){
		dy = 0;
		dx = hero_dx;
	}
	if( engine.events.iskeydown("left") ){
		dy = 0;
		dx = -hero_dx;
	}
	if( engine.events.iskeydown("a") ){
		hero.daBomb();
	}
	
	hero.dy = dy;
	hero.dx = dx;
	hero.update();
	
	var i = 0;
	for( ; i < level1.entity_list.length; i ++ ){
		entity = level1.entity_list[ i ];
		
		if( entity.tag == "block_destroyable"
			|| entity.tag == "block_indestructible" ){
			if( hero.collide( entity ) ){
				hero.x -= dx;
				hero.y -= dy;
				hero.dx = 0;
				hero.dy = 0;
			}
		}
	}
	
	engine.viewport.followTo( hero );
	engine.viewport.update();
};