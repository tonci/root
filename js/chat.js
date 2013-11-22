$(function() {
	var nick;
        var socket = io.connect('http://172.16.134.120:8082/chat');
        var lines = $('#lines');

        socket.on('connect', function () {
          //console.log('CON')
          lines.addClass('connected');
          $('#input').addClass('connected').prop('disabled', '');
        });

        socket.on('disconnect', function() {
          //console.log('DISC');
          lines.removeClass('connected');
          $('#input').removeClass('connected').prop('disabled', 'disabled');
        });

        socket.on('message', function (message) {
          lines.append($('<p>').append($('<em>').text(message)));
          lines.prop('scrollTop', lines.prop('scrollHeight'));
        });
        socket.on('say', function (user, message) {
          lines.append($('<p>').append($('<b>').text(user + ': ')).append(message))
          lines.prop('scrollTop', lines.prop('scrollHeight'));
        });
        socket.on('whisper', function (user, message) {
          lines.append($('<p>').append($('<em>').text(user + ' -> ' + message)))
          lines.prop('scrollTop', lines.prop('scrollHeight'));
        });
        socket.on('join', function (user) {
          lines.append($('<p>').append($('<em>').text(user + ' joined the channel.')));
          lines.prop('scrollTop', lines.prop('scrollHeight'));
        });
        socket.on('leave', function (user) {
          lines.append($('<p>').append($('<em>').text(user + ' left the channel.')));
          lines.prop('scrollTop', lines.prop('scrollHeight'));
        });
				socket.on('getNickName', function(nickname){
					nick = nickname;
					$('.chat_head .user').html(nickname);
					$('.chat_body').slideDown();
				})
        
        function send(message, callback){
          var s, c;
            s = message;
            // slash command?
            if ('/' === s[0]) {
              // get parameters for command
              s = s.split(' ');
              // remove slash from command name
              c = s[0].slice(1);
              // remove command name from parameters list
              s = s.slice(1);
              switch (c) {
                // whisper command
                case 'w':
                case 'whisper':
                case 'msg':
                case '@':
                  // get target user and join remaining parameters as text
                  var target = s[0], message = s.slice(1).join(' ');
                  socket.emit('whisper', target, message);
                  lines.append($('<p>').append($('<em>').text(target + ' <- ' + message)))
                  break;
                  // join command
                case 'j':
                case 'join':
                  // first parameter is channel, ignore rest
                  var channel = s[0];
                  socket.emit('join', channel, function (err) {
                    if (err) return lines.append($('<p>').append($('<em>').text(err)));
                    lines.append($('<p>').append($('<em>').text('You joined ' + channel)));
                  });
                  break;
                // leave command
                case 'l':
                case 'leave':
                case 'part':
                  socket.emit('leave', function (err) {
                    if (err) return lines.append($('<p>').append($('<em>').text(err)));
                    lines.append($('<p>').append($('<em>').text('You joined the lobby')));
                  });
                  
              }
            } else if ('@' === s[0]){
              target = s.split('@');
              target = target[1].split(' ');
              message = target.slice(1).join(' ');
              target = target[0];
              // get parameters for command
              s = s.split(' ');
              // remove slash from command name
              c = s[0].slice(1);
              // remove command name from parameters list
              s = s.slice(1);
              
                  socket.emit('whisper', target, message);
                  lines.append($('<p>').append($('<em>').text(target + ' <- ' + message)))
            } else {
              socket.emit('say', s);
            }
            
            callback();

        }
				
				$('.expander').click(function(){
					if($('.chat_body').is(':visible') ){
						$('.chat_body').slideUp();
					}else{
						 if(nick)
						$('.chat_body').slideDown();
					}
				})

        $("#send").click(function(){
          if ($('#input').val() != ''){
            send($('#input').val(), function(){
              $('#input').val('');
            })
          }
        })
				
				$('.submit_user').click(function(){
					if($('#username').val() != ''){
						socket.emit('setNickName', $('#username').val());
					}
				})
				
				$('#username').keypress(function(e){
					if (13 === e.which) {
						socket.emit('setNickName', $(this).val());
					}
				})
        
        $('#input').keypress(function (e) {
          // enter key pressed?
          if (13 === e.which) {
            if ($('#input').val() != ''){
              send(this.value, function(){
                $('#input').val('');
              });
            }
          }
        });
      });