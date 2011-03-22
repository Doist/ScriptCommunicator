/*
 * Implementation of script communication that:
 *  - uses script tags for communication, but can detect when a script isn't loaded (this is non-trivial to implement across browsers)
 *  - works across domains as long as you control the domains
 *  - works on IE 6, IE 7, IE 8, FF X, Safari, Chrome and Opera
 *  - small (80 lines of code) with no dependencies
 *
 * For more info and usage check out:
 *    http://amix.dk/blog/post/19489#ScriptCommunicator-implementing-comet-long-polling-for-all-browse
 *
 * Made by amix the lucky stiff - amix.dk
 * Copyright Plurk 2010, released under BSD license
 */
ScriptCommunicator = {

    callback_called: false,

    /*
     * Important:
     * The JavaScript you source must do some kind of call back into your code
     * and this call back has to set ScriptCommunicator.callback_called = true
     * for this to work!
     */
    sourceJavaScript: function(uri, on_success, on_error) {
        ScriptCommunicator.callback_called = false;

        ScriptCommunicator._onSuccess = on_success;
        ScriptCommunicator._onError = on_error;

        var loaded_text = 'if(!ScriptCommunicator.callback_called) {' + 
                              'ScriptCommunicator.onError();'+
                          '}'+
                          'else { ' +
                               'ScriptCommunicator.onSuccess();'+ 
                          '}';

        var agent = navigator.userAgent.toLowerCase();

        if(agent.indexOf("khtml") != -1) { //Safari
            document.writeln('<script type="text/javascript" src="'+uri+'" class="temp_script"><\/script>');
            document.writeln('<script type="text/javascript" class="temp_script">'+ loaded_text +'<\/script>');
        }
        else {
            var script_channel = document.createElement('script');
            script_channel.src = uri;
            script_channel.type = "text/javascript";
            script_channel.className = 'temp_script';

            var loaded = null;
            if(agent.indexOf("msie") != -1) { //IE
                script_channel.onreadystatechange = ScriptCommunicator.onSuccess;
            }
            else if(agent.indexOf('firefox/4.0')) {
                script_channel.onload = function() {
                    eval(loaded_text);
                }
            }
            else {
                var loaded = document.createElement('script');
                loaded.type = "text/javascript";
                loaded.className = 'temp_script';
                loaded.text = loaded_text;
            }

            var body = document.getElementsByTagName('body')[0];
            body.appendChild(script_channel);
            if(loaded)
                body.appendChild(loaded);
        }
    },

    onSuccess: function() {
        if(this.readyState == 'loaded' && !ScriptCommunicator.callback_called) {
            return ScriptCommunicator.onError();
        }

        if(!this.readyState || this.readyState === "loaded" || this.readyState === "complete") { 
            return ScriptCommunicator._onSuccess();
        }
    },

    onError: function() {
        return ScriptCommunicator._onError();
    }

}
