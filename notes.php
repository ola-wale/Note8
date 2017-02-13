<?php
require 'autoload/autoload.php';
if(!Note8::is_logged_in()){
	header('Location: ' . SITE_LINK . 'authenticate');
}
$user = Note8::user(false);
?>
<!--This is/was a school project and i'd love to keep it simple, no gulp,concating,minification (for readibility's sake)-->
<!DOCTYPE html>
<html>
	<head>
		<base href="<?php echo SITE_LINK ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="theme-color" content="#059e66">
		<script src="js/jQuery.min.js"></script>
		<script src="js/angular.js"></script>
		<script src="js/angular-route.min.js"></script>
		<script src="js/angular-animate.min.js"></script>
		<script src="js/angular-sanitize.min.js"></script>
		<script src="js/angular-messages.min.js"></script>
		<script src="js/imagesloaded.pkgd.min.js"></script>
		<script src="js/masonry.pkgd.min.js"></script>
		<link rel="stylesheet" href="css/animate.min.css">
		<link rel="stylesheet" href="css/style.css" />
		<link rel="stylesheet" href="css/grid12.css" />
		<link rel="stylesheet" href="css/themify-icons.css" />
		<script src="js/tinymce.min.js"></script>
		<link rel='stylesheet' href='css/loading-bar.min.css' type='text/css' media='all' />
		<script type='text/javascript' src='js/loading-bar.min.js'></script>
		<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
		<link rel="stylesheet" href="css/material.indigo-pink.min.css">
		<script defer src="js/material.min.js"></script>
		<script src="js/notify.js"></script>
		<script src="js/ng-tags-input.min.js"></script>
		<link rel="stylesheet" href="css/ng-tags-input.min.css" />
		<script src="js/angular-mce.js"></script>
		<script src="js/dash.js"></script>
	</head>
	<body data-ng-init="base = '<?php echo SITE_LINK ?>'" data-ng-app="note8" class="container-fluid main-notes">
		<div class="container-fluid view">
			<div class="row">
				<div class="row">
					<div data-ng-class="{'slide':slide}" class="side-col">
						<span class="view-indicator"></span>
						<div class="user">
							<a href="notes/settings">
								<div class="img">
									<img alt="{{user.firstname}}" title="{{user.firstname}}" data-ng-if="user.image" data-ng-src="{{user.image}}" />
									<img alt="{{user.firstname}}" title="{{user.firstname}}" data-ng-if="!user.image" data-ng-src="{{base}}images/nophoto_user.png" />
									<span class="ti-settings"></span>
								</div>
							</a>
							<h3 data-ng-bind="user.firstname">{{user.firstname}}</h3>
						</div>
						<ul class="side-menu">
							<li class="new-note"><a href="notes/new-note" class="no-decor">+ New Note</a></li>
							<li>
								<a href="<?php echo SITE_LINK ?>notes"><span class="v">Notes</span></a> <span class="note-count">{{user.notecount}}</span>
							</li>
						</ul>
						<ul data-ng-show="userTags" class="side-menu labels animated fadeIn" data-ng-controller="sideNotesController">
							<li>
								<small>Tags</small>
							</li>
							<li data-ng-show="tag" data-ng-repeat="tag in userTags"><span class="v"><a data-ng-href="notes/tag/{{tag}}"><i class="ti-tag"></i>{{tag}}</a></span></li>
						</ul>
						<ul class="side-menu labels animated fadeIn" data-ng-controller="sideNotesController">
								<li class="trash"><span class="v"><a href="notes/trash"><i class="ti-trash"></i>Trash</a></span></li>
								<li class="logout"><span class="v"><a target="_self" data-ng-href="{{base}}logout.php"><i class="ti-shift-left-alt"></i>Logout</a></span></li>
						</ul>
					</div>
					<div data-ng-class="{'dark-sheet':slide}"></div>
					<div class="view-col">
						<span data-ng-click="slide=true;" class="ti-menu side-toggle"></span>
						<header class="row">
							<div>
								<i class="ti-search"></i>
								<a data-ng-href="notes/search/{{query}}">
								<input data-ng-model-options="{ debounce: 550 }" data-ng-change="searchNotes(query)" data-ng-model="query" placeholder="Search Notes" />
								</a>
							</div>
						</header>
						<div data-select-count="{{selectedNotes}}" class="selected-toolbar margeview">
							<ul id="tbpalette-chooser" data-ng-class="{'bring':showToolbarPalette}" class="color-palette">
								<li data-ng-click="handleNoteColorChange(selectedNotesArr,c,$event)" data-palette-color={{c}} data-ng-repeat="c in allowedNoteColors"  style="background-color:{{c}}"></li>
							</ul>
							<div class="rel">
								<i data-ng-click="showToolbarPalette = selectedNotes = 0; selectedNotesArr = []; initSelectedNotes = [];" class="ti-close"></i>
								<span class="num-selected">{{selectedNotes}} Selected</span>
								<ul class="actions">
									<li data-ng-show="currentView != 'Trash'" data-ng-click="trashNote(selectedNotesArr)" id="tbtrashNote" class="ti-trash action"></li>
									<li data-ng-show="currentView != 'Trash'" class="mdl-tooltip mdl-tooltip--top" data-mdl-for="tbtrashNote">Move to Trash</li>
									<li data-ng-show="currentView == 'Trash'" data-ng-click="trashNote(selectedNotesArr,true,true,false)" id="dtbtrashNote" class="ti-trash action"></li>
									<li data-ng-show="currentView == 'Trash'" class="mdl-tooltip mdl-tooltip--top" data-mdl-for="dtbtrashNote">Delete</li>
									<li data-ng-click="showToolbarPalette = !showToolbarPalette" id="tbpalette" class="ti-palette action"></li>
									<li class="mdl-tooltip mdl-tooltip--top" data-mdl-for="tbpalette">Change Color</li>
									<li data-ng-click="duplicate(selectedNotesArr)" id="tbduplicate" class="ti-files action"></li>
									<li class="mdl-tooltip mdl-tooltip--top" data-mdl-for="tbduplicate">Make Copy</li>
									<li data-ng-show="currentView == 'Trash'" data-ng-click="restore(selectedNotesArr)" id="tbrestore" class="ti-export action"></li>
									<li data-ng-show="currentView == 'Trash'" class="mdl-tooltip mdl-tooltip--top" data-mdl-for="tbrestore">Restore Notes</li>
								</ul>
							</div>
						</div>
						<div style="width: 100%;display:block;" class="clearfix" data-ng-view></div>
					</div>
				</div>
			</div>
		</div>
		<modal data-ng-controller="insertImageController" data-ng-class="{ 'animated fadeIn': showImageModal, 'animated fadeOut': !showImageModal, 'imageselected' : selectedImages }" data-ng-show="showImageModal === true" id="ImageModal">
			<div class="box">
				<div class="title clearfix">
					<h6 class="pull-left">Upload an Image</h6>
					<span data-ng-click="closeImagesModal();" class="close pull-right">&times;</span>
				</div>
				<div class="collection">
					<div data-ng-class="{'vmiddle':!images}">
						<div data-ng-show="!images" class="no-images">
							<img alt="cam" src="images/cam.png" />
							<small>You have no images. Start by uploading one</small> <br />
							<span data-ng-click="trigger('#upload','click');" class="x-cool-button">UPLOAD</span>
						</div>
						<ul data-ng-show="images" class="imageLoop clearfix">
							<li data-ng-click="selectImages(image.id)" data-ng-class="{'selected':(selectedImagesArr.indexOf(image.id) > -1)}" data-ng-repeat="image in images">
								<img alt="img" data-ng-src="{{image.file}}" />
								<span class="check"><i class="ti-check"></i></span>
							</li>
						</ul>
					</div>
				</div>
				<div data-ng-show="images" class="bottom clearfix">
					<span data-ng-click="trigger('#upload','click');" class="x-cool-button">UPLOAD</span>
					<span data-ng-show="selectedImagesArr && selectedImages" data-ng-click="insertImages(selectedImagesArr);" class="x-cool-button insert">INSERT</span>
					<span data-ng-show="selectedImagesArr && selectedImages" data-ng-click="deleteImages(selectedImagesArr);" class="x-cool-button delete">DELETE</span>
				</div>
			</div>
		</modal>
		<modal data-ng-class="{ 'animated fadeIn': deleteIntent, 'animated fadeOut': !deleteIntent }" data-ng-show="deleteIntent" class="totalDelete">
			<div class="box">
				<h3>Are you sure you want to delete note?</h3>
				<span data-ng-click="trashNote(todel,true,false,true)" class="cool-button delete"><i class="ti-trash"></i> Yes</span>
				<span data-ng-click="deleteIntent=false"  class="save cool-button"><i class="ti-save"></i> No</span>
			</div>
		</modal>
	</body>
</html>