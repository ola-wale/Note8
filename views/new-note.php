<div ng-controller="newNoteController" class="col-sm-12 animated fadeIn new-note-view">
	<div class="task-title">
		<span class="ti-notepad"></span> <input class="n-title" placeholder="Enter Title" />
	</div>
	<editor></editor>
	<div class="statusbar tagbar">
		<tags-input ng-model="tags"></tags-input>
	</div>
	<div class="statusbar clearfix">
		<ul id="palette-chooser-newNote" class="color-palette">
			<li ng-click="setNewNoteColor(c)" data-palette-color={{c}} ng-repeat="c in allowedNoteColors" style="background-color:{{c}}"></li>
		</ul>
		<ul class="actions new-note-actions">
			<li ng-click="nToggleClass('#palette-chooser-newNote','block')" id="palettenewNote" class="ti-palette action"></li>
			<li class="mdl-tooltip" data-mdl-for="palettenewNote">Change Color</li>
		</ul>
		<span ng-click="saveNote()"  class="pull-right cool-button"><i class="ti-save"></i> Save Note</span>
	</div>
	 <input name="image" type="file" id="upload" class="hidden"  onchange="angular.element(this).scope().uploadImage(this.files)">
	<script id="scriptbase">

		tinymce.init(
			{
			 	selector:'editor',
				content_css : '../css/mce.css',
				menubar: false,
				statusbar: false,
				plugins: "image example",
				paste_data_images: true,
				toolbar: "example undo redo removeformat bold italic underline link print preview media fullpage alignleft aligncenter alignright alignjustify link bullist numlist outdent indent bullist numlist"
			}
		);
	</script>
</div>