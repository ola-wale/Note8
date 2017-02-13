$(document).ready(function() {
	$('body').on('click', '.side-col ul.side-menu li:not(.view-indicator) a', function(event) {
		$('.side-col ul.side-menu li:not(.view-indicator)').removeClass('active');
		var _offset = $(this).closest('li').offset().top;
		$(this).closest('li').addClass('active');
	});
});

var app = angular.module("note8", ['ngRoute', 'angular-loading-bar', 'ngAnimate', 'ngTagsInput', 'ngSanitize', 'ui.tinymce', 'ngMessages']);

app.filter('safe', function($sce) {
	return $sce.trustAsHtml;
});
app.directive('fileread', ['$parse', function($parse) {
	return {
		scope: {
			fileread: "="
		},
		link: function(scope, element, attributes) {
			element.bind("change", function(changeEvent) {
				var reader = new FileReader();
				reader.onload = function(loadEvent) {
					scope.$apply(function() {
						scope.fileread = loadEvent.target.result;
					});
				}
				reader.readAsDataURL(changeEvent.target.files[0]);
			});
		}
	}
}]);
app.run(function($rootScope, $parse, $location) {
	$('body').on('click', '.dark-sheet', function(event) {
		$rootScope.slide = false;
		$rootScope.$apply();
	});
	//run the following after every ajax complete
	$rootScope.$on('update', function() {
		//update user info - name, display image and stuff
		$rootScope.getUser();
		//update the tags by the sidebar
		$rootScope.get('tags', 'userTags');
		//update the colors
		$rootScope.get('colors', 'userColors');
	});
	/**
	 * get the user's uploaded Images
	 */
	$rootScope.getImages = function() {
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'getImages',
			},
			success: function(data) {
				$rootScope.images = JSON.parse(data);
				$rootScope.$apply();
				$rootScope.$broadcast('update');
			}
		});
	}
	/**
	 * get the user's data
	 */
	$rootScope.getUser = function() {
		$rootScope.user = {};
		$rootScope.user.image = '';
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'getUser'
			},
			success: function(data) {
				$rootScope.user = JSON.parse(data);
			}
		});
	}
	$rootScope.getUser();

	//rearrange the grid elements
	$rootScope.reLayout = function() {
		var options = {
			"transitionDuration": 0,
			"itemSelector": "note-item",
			"gutter": 25,
			"percentPosition": true
		}
		$rootScope.grid = $('.notes-view').masonry(options);
		$rootScope.grid.imagesLoaded().progress(function() {
			$rootScope.grid.masonry('layout');
		});
	}

	/**
	 * get a value from the DB
	 * @param  {string} get    value to get
	 * @param  {string} assign scope variable to assign to
	 * @return {Boolean} toReturn Placeholder
	 */
	$rootScope.get = function(get, assign) {
		var toReturn;
		var model = $parse(assign);
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'get',
				get: get
			},
			success: function(data) {
				model.assign($rootScope, JSON.parse(data));
			}
		});
		return toReturn;
	}
	/**
	 * get tags and assign them to the scope variable userTags
	 */
	$rootScope.get('tags', 'userTags');
	/**
	 * Get the user's note colors and assign them to the scope variable userColors
	 */
	$rootScope.get('colors', 'userColors');
	/**
	 * Run after changing routes successfully
	 */
	$rootScope.$on('$routeChangeSuccess', function(next, current) {
		/**
		 * Assign an attribute to the body with the current route name
		 */
		$('body').attr('data-view', current.$$route.Name);
		/**
		 * set currentView scope variable to the current route name
		 * @type {string}
		 */
		$rootScope.currentView = current.$$route.Name;
		/**
		 * empty the array of selected notes
		 * @type {Array}
		 */
		$rootScope.initSelectedNotes = [];
		/**
		 * Reset the selected notes count
		 * @type {Number}
		 */
		$rootScope.selectedNotesArr = 0;
		/**
		 * Reset the selected notes double count
		 * @type {Number}
		 */
		$rootScope.selectedNotes = 0;
		/**
		 * 'Clean' our notes
		 * @type {Array}
		 */
		$rootScope.notes = [];
		/**
		 * Get the user's note colors and assign them to the scope variable userColors
		 */
		$rootScope.get('tags', 'userTags');
		/**
		 * If the current route has a title param set it to the document name.
		 */
		if (current.$$route.Title) {
			document.title = current.$$route.Title;
		}
	});
	/**
	 * extend tinymce with an extra button
	 * @type {String}
	 */
	tinymce.PluginManager.add('example', function(editor, url) {
		// Add a button that opens a window
		editor.addButton('example', {
			title: 'Image',
			icon: 'mce-ico mce-i-image',
			onclick: function() {
				// Open window
				/**
				 * Show the Image modal
				 * @type {Boolean}
				 */
				$rootScope.showImageModal = true;
				/**
				 * empty the modal class var
				 * @type {String}
				 */
				$rootScope.modalCloseClass = '';
				/**
				 * Update the rootScope -- Angular2 >:(
				 */
				$rootScope.$apply();
				$rootScope.$digest();
			}
		});
	});

	/**
	 * Insert Images into the tinymce editor
	 * @param  {Array} selectedImagesArr an array of selected images
	 */
	$rootScope.insertImages = function(selectedImagesArr) {
		for (var x = 0; x < selectedImagesArr.length; x++) {
			for (var i = 0; i < $rootScope.images.length; i++) {
				if ($rootScope.images[i].id == selectedImagesArr[x]) {
					var img = '<img class="image-' + $rootScope.images[i].file + '" src="' + $rootScope.base + $rootScope.images[i].file + '" />'
					tinymce.activeEditor.execCommand('mceInsertContent', false, img);
				}
			}
		}
		//close the image modal
		$rootScope.closeImagesModal();
	}
	/**
	 * Close the images modal
	 */
	$rootScope.closeImagesModal = function() {
		$rootScope.showImageModal = false;
		$rootScope.initSelectedImages = [];
		$rootScope.selectedImages = 0;
		$rootScope.selectedImagesArr = [];
	}

	//an array of the allowed palette note colors
	$rootScope.allowedNoteColors = ['#fff93f', '#ff3f3f', '#3fff71', '#a3ff3f', '#ffffff'];
	$rootScope.initSelectedNotes = [];
	$rootScope.selectedNotes = 0;
	$rootScope.initSelectedImages = [];
	$rootScope.selectedImages = 0;
	/**
		nToggleClass
		Ng-click toggle class
		@param string elem The css selector of the element to toggle class on.
	**/
	$rootScope.nToggleClass = function(elem, _class) {
		$(elem).toggleClass(_class);
	}
	/**
	 * Do an ajax request to trash a note then update the dom by removing and fading out the note element
	 * @param  {Number} thisNoteId               the id of the note to trash
	 * @param  {Boolean} [move=false]             move the note to trash if it isn't in the trash already
	 * @param  {Boolean} [showModal=false]        show the confirm delete image modal
	 * @param  {Boolean} [deleteCompletely=false] to delete completely ???
	 */
	$rootScope.trashNote = function(thisNoteId, move = false, showModal = false, deleteCompletely = false) {
		if (showModal) {
			$rootScope.deleteIntent = true;
			$rootScope.todel = thisNoteId;
			return;
		}
		//do Ajax to trash note;
		if (typeof thisNoteId === 'number' || typeof thisNoteId === 'string') {
			thisNoteId = [thisNoteId];
		}
		var counter = 0;
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'trashNote',
				notes: thisNoteId,
				deleteCompletely: deleteCompletely,
			},
			success: function(data) {
				if (data == 1) {
					if (!deleteCompletely) {
						notify('success', 'Notes moved to trash');
					} else {
						notify('success', 'Note(s) deleted');
						$rootScope.deleteIntent = false;
						$rootScope.$apply(function() {
							$location.path("/trash");
						});
					}

					if (move) {
						$rootScope.$apply(function() {
							$location.path("/notes");
						});
					}
					thisNoteId.forEach(function(i) {
						counter++;
						$rootScope.grid.masonry('remove', $('#note-' + i))
						if (counter == thisNoteId.length) {
							$rootScope.reLayout()
						}
					});
					$rootScope.initSelectedNotes = [];
					$rootScope.selectedNotesArr = 0;
					$rootScope.selectedNotes = 0;
					$rootScope.$apply();
				} else {
					notify('error', 'An error has occurred');
				}
				$rootScope.$broadcast('update');
			}
		});

	}
	/**
	 * Change note color
	 * @param  {number} id     the id of the note
	 * @param  {String} color  the color to set
	 * @param  {String} $event callback
	 */
	$rootScope.handleNoteColorChange = function(id, color, $event) {
		var thisNoteId = id;
		if (typeof thisNoteId === 'number' || typeof thisNoteId === 'string') {
			thisNoteId = [thisNoteId];
		}
		thisNoteId.forEach(function(i) {
			var $thisPalette = $(this).attr('data-palette-color');
			var $thisClosestNoteItem = $('#note-' + i);
			$thisClosestNoteItem.css('background-color', color);
			$thisClosestNoteItem.find('.color-palette').children('li').removeClass('active-color');
			$(event.target).addClass('active-color');
			$('#palette-chooser-' + i).removeClass('bring');
		});
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'changeNoteColor',
				notes: thisNoteId,
				color: color
			},
			success: function(data) {
				if (data == 1) {
					notify('success', 'Note Color Changed');
				} else {
					notify('error', 'An error has occurred');
				}
			}
		});
	}
	/**
	 * Delete images
	 * @param  {array} images an array of image ids to delete
	 */
	$rootScope.deleteImages = function(images) {
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'deleteImages',
				images: images,
			},
			success: function(data) {
				$('body').prepend(data);
				$rootScope.getImages();
			}
		});
	}
	/**
	 * Do an ajax request to duplicate a note then update the DOM with the new note element
	 * @param  {Boolean} thisNoteId id of the note to duplicate
	 */
	$rootScope.duplicate = function(thisNoteId) {
		if (typeof thisNoteId === 'number' || typeof thisNoteId === 'string') {
			thisNoteId = [thisNoteId];
		}
		var counter = 0;
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'duplicateNote',
				notes: thisNoteId,
			},
			success: function(data) {
				if (data) {
					var toParse = JSON.parse(data);

					notify('success', 'Note(s) Duplicated');
					$rootScope.notes.unshift(toParse);
					$rootScope.$apply();
					$rootScope.grid.masonry('destroy')
					setTimeout(function() {
						$rootScope.reLayout();
					}, 500);
					$rootScope.initSelectedNotes = [];
					$rootScope.selectedNotesArr = 0;
					$rootScope.selectedNotes = 0;
					$rootScope.$apply();
				} else {
					notify('error', 'An error has occurred');
				}
				$rootScope.$broadcast('update');
			}
		});
	}
	/**
		duplicate
		Do an ajax request to duplicate a note then update the DOM with the new note element
		@param int noteId The ID of the Note to duplicateh.
	**/
	/**
	 * Select notes
	 * @param  {number} noteId Id of note to add to selection
	 * @return {[type]}        [description]
	 */
	$rootScope.selectNote = function(noteId) {
		if ($.inArray(noteId, $rootScope.initSelectedNotes) > -1) {
			var index = $rootScope.initSelectedNotes.indexOf(noteId);
			$rootScope.initSelectedNotes.splice(index, 1);
		} else {
			$rootScope.initSelectedNotes.push(noteId)
		}
		$rootScope.selectedNotesArr = $rootScope.initSelectedNotes;
		$rootScope.selectedNotes = $rootScope.initSelectedNotes.length;
	}
	/**
	 * Select images
	 * @param  {number} imageId id of image to add to selection
	 * @return {[type]}         [description]
	 */
	$rootScope.selectImages = function(imageId) {
		if ($.inArray(imageId, $rootScope.initSelectedImages) > -1) {
			var index = $rootScope.initSelectedImages.indexOf(imageId);
			$rootScope.initSelectedImages.splice(index, 1);
		} else {
			$rootScope.initSelectedImages.push(imageId)
		}
		$rootScope.selectedImagesArr = $rootScope.initSelectedImages;
		$rootScope.selectedImages = $rootScope.initSelectedImages.length;
	}
	/**
	 * Trigger event on an element
	 * @param  {string} selector element selector
	 * @param  {event} e        event to trigger
	 */
	$rootScope.trigger = function(selector, e) {
		$(selector).trigger(e);
	}
	/**
	 * Restore a notes from the trash
	 * @param  {Number} thisNoteId id of the note to restore
	 */
	$rootScope.restore = function(thisNoteId) {
		if (typeof thisNoteId === 'number' || typeof thisNoteId === 'string') {
			thisNoteId = [thisNoteId];
		}
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'restoreNote',
				notes: thisNoteId
			},
			success: function(data) {
				var counter = 0
				notify('success', 'Note(s) restored.');
				thisNoteId.forEach(function(i) {
					counter++;
					$rootScope.grid.masonry('remove', $('#note-' + i))
					if (counter == thisNoteId.length) {
						$rootScope.reLayout();
					}
				});
				$rootScope.$broadcast('update');
			}
		});
	}
})
/**
 * App configuration
 */
app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/notes/new-note', {
			Name: 'newnote',
			Title: 'Create a new note',
			templateUrl: "views/new-note.php"
		})
		.when('/notes/settings', {
			Name: 'Settings',
			Title: 'Settings',
			templateUrl: "views/settings.php"
		})
		.when('/notes/search', {
			Name: 'search',
			Title: 'Search Notes',
			templateUrl: "views/search.php",
			controller: 'searchNotesController'
		})
		.when('/notes/search/:q', {
			Name: 'search',
			Title: 'Search Notes',
			templateUrl: "views/notesview.php",
			controller: 'searchNotesController'
		})
		.when('/notes/view/:i', {
			Name: 'Note',
			templateUrl: "views/view.php",
			controller: 'noteViewController'
		})
		.when('/notes/trash', {
			Name: 'Trash',
			Title: 'Trash',
			templateUrl: "views/notesview.php",
			controller: 'notesTrashController'
		})
		.when('/notes', {
			Name: 'noteview',
			Title: 'Notes',
			templateUrl: "views/notesview.php",
			controller: 'notesController'
		})
		.when('/notes/tag/:tag', {
			Name: 'noteview',
			templateUrl: "views/notesview.php",
			controller: 'notesbyTagController'
		})
		.when('/notes/color/:color', {
			Name: 'color',
			templateUrl: "views/notesview.php",
			controller: 'notesbyColorController'
		})
	$locationProvider.html5Mode(true);
});
/**
 * Notes Controller
 * @type {String}
 */
app.controller('notesController', function($scope, $rootScope) {
	$.ajax({
		type: 'POST',
		url: 'api.php',
		data: {
			doing: 'getNotes',
		},
		success: function(data) {
			$rootScope.notes = JSON.parse(data);
			$scope.$apply();
			$rootScope.reLayout();
			$rootScope.$broadcast('update');
		}
	});
})
/**
 * Trash view controller
 */
app.controller('notesTrashController', function($scope, $rootScope) {
	//get notes from trash via ajax
	$.ajax({
		type: 'POST',
		url: 'api.php',
		data: {
			doing: 'getNotes',
			trash: ''
		},
		success: function(data) {
			$rootScope.notes = JSON.parse(data);
			$scope.$apply();
			$rootScope.reLayout();
			$rootScope.$broadcast('update');
		}
	});
})
/**
 * New Note View Controller
 */
app.controller('newNoteController', function($scope, $rootScope) {
	$scope.newNoteColor = '#fff';
	/**
	 * sets the background color of the new note
	 * @param {String} color the new color to set
	 */
	$scope.setNewNoteColor = function(color) {
		$(tinymce.activeEditor.getBody()).css('background-color', color);
		$scope.newNoteColor = color;
	}
	/**
	 * Save a note
	 */
	$scope.saveNote = function() {
		var tags = {};
		for (var i in $scope.tags) {
			tags[i] = $scope.tags[i].text;
		}
		/**
			New Note Data
		**/
		var data = {
			doing: 'saveNote',
			contents: tinyMCE.activeEditor.getContent(),
			title: $('.n-title').val(),
			tags: tags,
			color: $scope.newNoteColor
		}
		/**
		Ajax call to set a new note.
		**/
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: data,
			success: function(data) {
				$rootScope.$broadcast('update');
			}
		});
	}
	/**
	 * Update a note
	 * @param  {Number} id id of the note to update
	 */
	$scope.updateNote = function(id) {
		var tags = {};
		for (var i in $scope.currentNote.tags) {
			tags[i] = $scope.currentNote.tags[i].text;
		}
		/**
			New Note Data
		**/
		var data = {
			doing: 'updateNote',
			contents: tinyMCE.activeEditor.getContent(),
			title: $('.n-title').val(),
			tags: tags,
			color: $scope.currentNote.color,
			id: id
		}
		/**
		Ajax call to set a new note.
		**/
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: data,
			success: function(data) {
				if (data == 1) {
					notify('success', 'Note Updated.');
				} else {
					notify('error', 'Error occurred');
				}
				$rootScope.$broadcast('update');
			}
		});
	}
	/**
	 * set the document title
	 * @type {String}
	 */
	document.title = 'New Note | Note8';
	/**
	 * Upload an Image
	 * @param  {Array} files form data
	 */
	$scope.uploadImage = function(files) {
		//get the file extension after the last full stop in the file bame
		var ext = files[0].name.match(/\.(.+)$/)[1];
		//if the file extension is jpg or jpeg or png or gif or svvg
		if (angular.lowercase(ext) === 'jpg' || angular.lowercase(ext) === 'jpeg' || angular.lowercase(ext) === 'png' || angular.lowercase(ext) === 'gif' || angular.lowercase(ext) === 'svg') {
			//create a new form
			var form = new FormData(document.getElementById('upload'));
			//get the first file from files
			var file = files[0];
			//if file is not empty
			if (file) {
				//append an input with the value of file with the name upload-image to file.
				form.append('upload-image', file);
				//also append in input with the name doing and value uploadingImage to let our api.php know we're appending an image.
				form.append('doing', 'uploadingImage');
			}
			//do an ajax call to api.php to upload our Image
			$.ajax({
				type: "POST",
				url: "api.php",
				data: form,
				cache: false,
				contentType: false,
				processData: false,
				success: function(data) {
					//refresh our images
					$rootScope.getImages();
					//append the gotten result from our ajax call to the body
					$('body').append(data);
					$rootScope.$broadcast('update');
				}
			});
		} else {
			//if the file extension is not jpg,jpeg,png & svg
			//show an error notification with the message 'Please upload a valid Image file.'
			notify('error', 'Please upload a valid Image file.');
		}
	}
});
/**
 * Note by tags Controller
 */
app.controller('notesbyTagController', function($scope, $rootScope, $routeParams) {
	var currentTag = $routeParams.tag;
	var data = {
		doing: 'getNotes',
		tag: currentTag
	}
	document.title = currentTag;
	$.ajax({
		type: 'POST',
		url: 'api.php',
		data: data,
		success: function(data) {
			$rootScope.notes = JSON.parse(data);
			$scope.$apply();
			$rootScope.reLayout();
			$rootScope.$broadcast('update');
		}
	});
});
/**
 * Notes by colors controller
 */
app.controller('notesbyColorController', function($scope, $rootScope, $routeParams) {
	var currentColor = $routeParams.color;
	var data = {
		doing: 'getNotes',
		color: currentColor
	}
	$.ajax({
		type: 'POST',
		url: 'api.php',
		data: data,
		success: function(data) {
			$rootScope.notes = JSON.parse(data);
			$scope.$apply();
			$rootScope.reLayout();
			$rootScope.$broadcast('update');
		}
	});
});
/**
 * insertImageController
 */
app.controller('insertImageController', function($scope, $rootScope) {
	$rootScope.getImages();
});
/**
 * Placeholder
 */
app.controller('sideNotesController', function($scope, $rootScope) {});
/**
 * Note search view controller
 */
app.controller('searchNotesController', function($scope, $rootScope, $location, $routeParams) {
	/**
	 * Take a query and use it to look for notes
	 * @param  {String} q Search Query
	 */
	$rootScope.searchNotes = function(q) {
		if (typeof q === 'undefined') {
			return;
		}
		var data = {
			doing: 'getNotes',
			query: q
		}
		$location.path('/notes/search/' + q);
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: data,
			success: function(data) {
				$rootScope.notes = JSON.parse(data);
				$scope.$apply();
				$rootScope.reLayout();
				$rootScope.$broadcast('update');
			}
		});
	}
	$rootScope.searchNotes($routeParams.q);
});
/**
 * Settings controller
 * @type {[type]}
 */
app.controller('settingsController', function($scope, $rootScope) {
	$scope.f = function() {
		$scope.settingsForm.oldpassword.$setValidity("correct", false);
	}
	/**
	 * Save settingsForm
	 * @param  {FormData} settingsForm settings form data
	 */
	$scope.saveSettings = function(settingsForm) {
		if (settingsForm.$valid) {
			$.ajax({
				type: 'POST',
				url: 'api.php',
				data: {
					doing: 'saveSettings',
					user: $scope.user
				},
				success: function(data) {
					$('head').prepend(data)
				}
			});
		}
	}
	/**
	 * Check passwords if they match
	 */
	$scope.check = function() {
		if ($scope.user.newpassword != $scope.user.confirmnewpassword) {
			$scope.settingsForm.confirmnewpassword.$setValidity("correct", false);
		} else {
			$scope.settingsForm.confirmnewpassword.$setValidity("correct", true);
		}
	}
})
/**
 * Note view controller
 */
app.controller('noteViewController', function($scope, $rootScope, $location, $routeParams) {
	var mceReady = false
	$scope.tinymceOptions = {
		setup: function(ed) {
			ed.on('init', function(args) {
				mceReady = true;
			});
		},
		content_css: $rootScope.base + '/css/mce.css',
		menubar: false,
		statusbar: false,
		plugins: "image example",
		paste_data_images: true,
		toolbar: "example undo redo removeformat bold italic underline link print preview media fullpage alignleft aligncenter alignright alignjustify link bullist numlist outdent indent bullist numlist"
	}

	var noteId = $routeParams.i;
	$.ajax({
		type: 'POST',
		url: 'api.php',
		data: {
			doing: 'viewNote',
			id: noteId
		},
		success: function(data) {
			$scope.currentNote = JSON.parse(data);
			if ($scope.currentNote.title) {
				document.title = $scope.currentNote.title;
			}
			$scope.currentNote.tags = $scope.currentNote.tags.split("/tagsept/").filter(Boolean);
			$scope.$apply();
			$rootScope.$broadcast('update');
			var interval = setInterval(function() {
				if (tinymce.activeEditor) {
					$(tinymce.activeEditor.getBody()).css('background-color', $scope.currentNote.color);
					clearInterval(interval);
				}
			}, 200);
		}
	});
})