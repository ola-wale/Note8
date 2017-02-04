$(document).ready(function() {
	$('body').on('click', '.side-col ul.side-menu li:not(.view-indicator) a', function(event) {
		$('.side-col ul.side-menu li:not(.view-indicator)').removeClass('active');
		var _offset = $(this).closest('li').offset().top;
		$(this).closest('li').addClass('active');
		var $this = $(this).closest('li');
		$('.side-col .view-indicator').css('transform', 'translateY(' + _offset + 'px)')
			.css('height', $this.css('height'));
	});
});

var app = angular.module("note8", ['ngRoute', 'angular-loading-bar', 'ngAnimate', 'ngTagsInput', 'ngSanitize','ui.tinymce','ngMessages']);

app.filter('safe', function($sce) {
	return $sce.trustAsHtml;
});
app.directive('fileread', ['$parse', function ($parse) {
	return {
			scope: {
					fileread: "="
			},
			link: function (scope, element, attributes) {
					element.bind("change", function (changeEvent) {
							var reader = new FileReader();
							reader.onload = function (loadEvent) {
									scope.$apply(function () {
											scope.fileread = loadEvent.target.result;
									});
							}
							reader.readAsDataURL(changeEvent.target.files[0]);
					});
			}
	}
}]);
app.run(function($rootScope,$parse,$location) {
$('body').on('click', '.dark-sheet', function(event) {
	$rootScope.slide = false;
	$rootScope.$apply();
});
	//run the following after every ajax complete
	$rootScope.$on('update', function() {
		//update user info - name, display image and stuff
  	$rootScope.getUser();
		//update the tags by the sidebar
		$rootScope.get('tags','userTags');
		//update the colors
		$rootScope.get('colors','userColors');
	});

	$rootScope.getImages = function(){
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

	$rootScope.getUser = function(){
		$rootScope.user = {};
		$rootScope.user.image = 'https://images.pexels.com/photos/27411/pexels-photo-27411.jpg?w=1260&h=750&auto=compress&cs=tinysrgb';
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {doing:'getUser'},
			success: function(data) {
								console.log(data);
				$rootScope.user = JSON.parse(data);
			}
		});
	}
	$rootScope.getUser();

	//rearrange the grid elements
	$rootScope.reLayout = function(){
	// var options = { "transitionDuration" : 0 , "itemSelector" : "note-item","gutter" : 25,"percentPosition" : true}
	// $rootScope.grid = $('.notes-view').masonry(options);
	// console.log($rootScope.grid)
	// $rootScope.grid.imagesLoaded().progress( function() {
	// 	$rootScope.grid.masonry('layout');
	// });
}
	$rootScope.get = function(get,assign){
		var toReturn;
		var model = $parse(assign);
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {doing:'get',get:get},
			success: function(data) {
				model.assign($rootScope,JSON.parse(data));
			}
		});
		return toReturn;
	}

	$rootScope.get('tags','userTags');
	$rootScope.get('colors','userColors');
	$rootScope.$on('$routeChangeSuccess', function(next, current) {
		$('body').attr('data-view', current.$$route.Name);
		$rootScope.currentView = current.$$route.Name;
		$rootScope.initSelectedNotes = [];
		$rootScope.selectedNotesArr = 0;
		$rootScope.selectedNotes = 0;
		$rootScope.notes = []
		$rootScope.get('tags','userTags');
		if(current.$$route.Title){
			document.title = current.$$route.Title;
		}
		setTimeout(function(){
			var $this = $('.side-col span.v:contains('+current.$$route.Name+')').find('a');
			if(typeof $this.closest('li').offset() == 'undefined'){
				return;
			}
			$('.side-col ul.side-menu li:not(.view-indicator)').removeClass('active');
			var _offset = $this.closest('li').offset().top;
			$this.closest('li').addClass('active');
			var $this = $this.closest('li');
			$('.side-col .view-indicator').css('transform', 'translateY(' + _offset + 'px)').css('height', $this.css('height'));
		},1000);
	});
	$rootScope.url = 'http://localhost/';

	tinymce.PluginManager.add('example', function(editor, url) {
		// Add a button that opens a window
	editor.addButton('example', {
		title: 'Image',
		icon: 'mce-ico mce-i-image',
		onclick: function() {
			// Open window
			$rootScope.showImageModal = true;
			$rootScope.modalCloseClass = '';
			$rootScope.$apply();
			$rootScope.$digest();
		}
	});
});

$rootScope.insertImages = function(selectedImagesArr){
	for(var x =0; x < selectedImagesArr.length; x++){
	for(var i = 0; i < $rootScope.images.length; i++){
		if($rootScope.images[i].id == selectedImagesArr[x]){
			var img = '<img class="image-'+$rootScope.images[i].file+'" src="'+$rootScope.base+$rootScope.images[i].file+'" />'
			tinymce.activeEditor.execCommand('mceInsertContent', false, img);
		}
	}
	}
	//close the image modal
	$rootScope.closeImagesModal();
}

$rootScope.closeImagesModal = function(){
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
		trashNote
		Do an ajax request to trash a note then update the dom by removing and fading out the note element
		@param int noteId The ID of the Note to trash.
	**/
	$rootScope.trashNote = function(thisNoteId,move=false,showModal=false,deleteCompletely=false) {
		if(showModal){
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
				notes:thisNoteId,
				deleteCompletely:deleteCompletely,
			},
			success: function(data) {
				if(data == 1){
					if(!deleteCompletely){
						notify('success', 'Notes moved to trash');
					} else {
						notify('success', 'Note(s) deleted');
						$rootScope.deleteIntent = false;
						$rootScope.$apply(function() {
						$location.path( "/trash" );
					});
					}

					if(move){
						$rootScope.$apply(function() {
						$location.path( "/notes" );
					});
					}
					thisNoteId.forEach(function(i) {
						counter++;
						$rootScope.grid.masonry( 'remove', $('#note-' + i) )
						if(counter == thisNoteId.length){
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
				notes:thisNoteId,
				color:color
			},
			success: function(data) {
				if(data == 1){
					notify('success', 'Note Color Changed');
				} else {
					notify('error', 'An error has occurred');
				}
			}
		});
	}

	//>:( delete images
	$rootScope.deleteImages = function(images){
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'deleteImages',
				images:images,
			},
			success: function(data) {
				$('body').prepend(data);
				$rootScope.getImages();
			}
		});
	}
	/**
		duplicate
		Do an ajax request to duplicate a note then update the DOM with the new note element
		@param int noteId The ID of the Note to duplicateh.
	**/
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
					notes:thisNoteId,
				},
				success: function(data) {
					if(data){
						var toParse = JSON.parse(data);

						notify('success', 'Note(s) Duplicated');
							$rootScope.notes.unshift(toParse);
							$rootScope.$apply();
							$rootScope.grid.masonry('destroy')
						setTimeout(function(){
						$rootScope.reLayout();
					},500);
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
	$rootScope.selectNote = function(noteId) {
		if ($.inArray(noteId, $rootScope.initSelectedNotes) > -1) {
			var index = $rootScope.initSelectedNotes.indexOf(noteId);
			$rootScope.initSelectedNotes.splice(index, 1);
		} else {
			$rootScope.initSelectedNotes.push(noteId)
		}
		$rootScope.selectedNotesArr = $rootScope.initSelectedNotes;
		$rootScope.selectedNotes = $rootScope.initSelectedNotes.length;
		//$('#note-' + noteId).toggleClass('selected');
	}

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

	$rootScope.reEnforceNotes = function() {

	}

	$rootScope.trigger = function(selector,e){
		$(selector).trigger(e);
	}

	$rootScope.restore = function(thisNoteId){
		if (typeof thisNoteId === 'number' || typeof thisNoteId === 'string') {
			thisNoteId = [thisNoteId];
		}
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: {
				doing: 'restoreNote',
				notes:thisNoteId
			},
			success: function(data) {
				var counter = 0
				notify('success', 'Note(s) restored.');
				thisNoteId.forEach(function(i) {
					counter++;
					$rootScope.grid.masonry( 'remove', $('#note-' + i) )
					if(counter == thisNoteId.length){
						$rootScope.reLayout();
					}
				});
				$rootScope.$broadcast('update');
			}
		});
	}

})
app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/notes/new-note', {
			Name: 'newnote',
			Title:'Create a new note',
			templateUrl: "views/new-note.php"
		})
		.when('/notes/settings', {
			Name: 'Settings',
			Title:'Settings',
			templateUrl: "views/settings.php"
		})
		.when('/notes/search', {
			Name: 'search',
			Title:'Search Notes',
			templateUrl: "views/search.php",
			controller: 'searchNotesController'
		})
		.when('/notes/search/:q', {
			Name: 'search',
			Title:'Search Notes',
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
			Title:'Trash',
			templateUrl: "views/notesview.php",
			controller: 'notesTrashController'
		})
		.when('/notes', {
			Name: 'noteview',
			Title:'Notes',
			templateUrl: "views/notesview.php",
			controller:'notesController'
		})
		.when('/notes/tag/:tag', {
			Name: 'noteview',
			templateUrl: "views/notesview.php",
			controller:'notesbyTagController'
		})
		.when('/notes/color/:color', {
			Name: 'color',
			templateUrl: "views/notesview.php",
			controller:'notesbyColorController'
		})
	$locationProvider.html5Mode(true);
});
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
app.controller('notesTrashController', function($scope, $rootScope) {
	//get notes from trash via ajax
	$.ajax({
		type: 'POST',
		url: 'api.php',
		data: {
			doing: 'getNotes',
			trash:''
		},
		success: function(data) {
			$rootScope.notes = JSON.parse(data);
			$scope.$apply();
			$rootScope.reLayout();
			$rootScope.$broadcast('update');
		}
	});
})
app.controller('newNoteController', function($scope, $rootScope) {
	$scope.newNoteColor = '#fff';
	/**
		setNewNoteColor
		sets the background color of the new note
		@param color string - The Color to set.
	**/
	$scope.setNewNoteColor = function(color) {
		$(tinymce.activeEditor.getBody()).css('background-color', color);
		$scope.newNoteColor = color;
	}

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
				title:$('.n-title').val(),
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
				title:$('.n-title').val(),
				tags: tags,
				color: $scope.currentNote.color,
				id:id
			}
			/**
			Ajax call to set a new note.
			**/
		$.ajax({
			type: 'POST',
			url: 'api.php',
			data: data,
			success: function(data) {
				if(data == 1){
					notify('success', 'Note Updated.');
				} else {
					notify('error', 'Error occurred');
				}
				$rootScope.$broadcast('update');
			}
		});
	}
	document.title = 'New Note | Note8';

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
app.controller('notesbyTagController', function($scope, $rootScope, $routeParams) {
	var currentTag = $routeParams.tag;
	var data = {
		doing: 'getNotes',
		tag:currentTag
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
app.controller('notesbyColorController', function($scope, $rootScope, $routeParams) {
	var currentColor = $routeParams.color;
	var data = {
		doing: 'getNotes',
		color:currentColor
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
app.controller('insertImageController', function($scope, $rootScope) {
	$rootScope.getImages();
});
app.controller('sideNotesController', function($scope, $rootScope) {

});
app.controller('searchNotesController', function($scope, $rootScope,$location,$routeParams) {
	$rootScope.searchNotes = function(q){
		if(typeof q === 'undefined'){return;}
		var data = {
			doing: 'getNotes',
			query:q
		}
		$location.path('/notes/search/'+ q);
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

app.controller('settingsController',function($scope,$rootScope){
	$scope.f = function(){
		$scope.settingsForm.oldpassword.$setValidity("correct",false);
	}
	$scope.saveSettings = function(settingsForm){
		if(settingsForm.$valid){
			$.ajax({
				type: 'POST',
				url: 'api.php',
				data:{doing:'saveSettings',user:$scope.user},
				success: function(data) {
					$('head').prepend(data)
				}
			});
		}
	}
	$scope.check = function(){
		if($scope.user.newpassword != $scope.user.confirmnewpassword){
				$scope.settingsForm.confirmnewpassword.$setValidity("correct",false);
		} else {
			$scope.settingsForm.confirmnewpassword.$setValidity("correct",true);
		}
	}
})

app.controller('noteViewController',function($scope, $rootScope,$location,$routeParams){
	var mceReady = false
	$scope.tinymceOptions = 			{
		setup: function (ed) {
        ed.on('init', function(args) {
            mceReady = true;
        });
    },
					content_css : $rootScope.base+'/css/mce.css',
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
		data:{doing:'viewNote',id:noteId},
		success: function(data) {
			$scope.currentNote = JSON.parse(data);
			if($scope.currentNote.title){
				document.title = $scope.currentNote.title;
			}
			$scope.currentNote.tags = $scope.currentNote.tags.split("/tagsept/").filter(Boolean);
			$scope.$apply();
			$rootScope.$broadcast('update');
			var interval = setInterval(function(){
				if(tinymce.activeEditor){
					$(tinymce.activeEditor.getBody()).css('background-color', $scope.currentNote.color);
					clearInterval(interval);
				}
			},200);
		}
	});
})