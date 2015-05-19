// ==UserScript==
// @name        Force Remember Password
// @namespace   https://github.com/JavierParra/userscripts
// @include     *
// @version     1
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// ==/UserScript==

// It's always better to be specific on our @includes and specify a selector here.
var containerSelector = false;

// jQuery always assigns itself to the window so we use the following to prevent conflicts. ('this' refers to the GM sandbox, not the window.)
this.$ = this.jQuery = jQuery.noConflict(true);


/**
 * Wraps an HTMLElement inside an unsubmittable form.
 * @param  {HTMLElement} container
 * @return {HTMLElement}           The wrapper form
 */
var wrapInForm = function(container){
	var rememberForm = document.createElement('form');
	// I don't think this is really necessary but we try to make it look like a real form.
	rememberForm.setAttribute('method', 'POST');
	rememberForm.setAttribute('action', document.location);

	//We prevent the default behavior of submitting the form because the badly written page doesn't expect a submit event.
	rememberForm.onSubmit = function(ev){
		ev.preventDefault();
		return false;
	}

	container.parentNode.insertBefore(rememberForm, container);
	rememberForm.appendChild(container);
	return rememberForm;
	
}


//If we specified a selector, we just wrap everything that matches.
if(containerSelector){
	var container = $(containerSelector);
	if(!container.length){
		console.warn('[forceRememberPassword] Couldn\'t find anything for selector: ', containerSelector);
	}else{
		container.each(function(key, element){
			console.info('[forceRememberPassword] Wrapping: ', element);
			wrapInForm(element);
		});
	}
}else{
	//If we don't know the layout of the page, we can try to guess it. Might be processor intensive on big DOMs.
	var passwordElements = $('input[type="password"]');

	passwordElements.each(function(key, element){
		//If there's no form, this will return every parent node up until the HTML.
		var findForm = $(element).parentsUntil('form');
		var hasForm = findForm.last()[0].nodeName !== 'HTML';
		var container, lastLength;

		if(hasForm){
			return;
		}
		//We check each parent 
		findForm.each(function(key, element){
			//We know that our input is not wrapped in a form field so if there's one inside this node, we assume the container was the last one.
			if($(element).find('form').length){
				return false;
			}

			//We count the number of formElements that descend from this node.
			var curLength = $(element).find('input, button, textarea').length;

			//If there are no new formElements in this node, we assume the container was the last one to add one.
			if(curLength === lastLength){
				return false;
			}

			// We have to keep track of our lengths and previous element.
			lastLength = curLength;
			container = element;
		});

		if(container.nodeName === 'HTML'){
			console.warn('[forceRememberPassword] Couldn\'t find a container for: ', element);
			return;
		}

		console.info('[forceRememberPassword] Guessed form container as: ', container);
		wrapInForm(container);

	});
}