<div ng-controller="newNoteController" class="col-sm-12 animated fadeIn new-note-view">
	<div class="task-title">
		<span class="ti-notepad"></span> <input ng-model="currentNote.title" class="n-title" placeholder="Enter Title" />
	</div>
	<textarea id="tinymce2" ui-tinymce="tinymceOptions" ng-model="currentNote.content"></textarea>
	<div class="statusbar tagbar">
		<tags-input ng-model="currentNote.tags"></tags-input>
	</div>
	<div class="statusbar clearfix">
		<ul id="palette-chooser-newNote" class="color-palette">
			<li ng-click="setNewNoteColor(c); currentNote.color = c" data-palette-color={{c}} ng-repeat="c in allowedNoteColors" style="background-color:{{c}}"></li>
		</ul>
		<ul class="actions new-note-actions">
			<li ng-click="nToggleClass('#palette-chooser-newNote','block')" id="palettenewNote" class="ti-palette action"></li>
			<li class="mdl-tooltip" data-mdl-for="palettenewNote">Change Color</li>
		</ul>
		<span ng-click="updateNote(currentNote.id)"  class="pull-right save cool-button"><i class="ti-save"></i> Update Note</span>
		<span ng-show="currentNote.folder != 'trash'" ng-click="trashNote(currentNote.id,true,false)" class="cool-button delete pull-right"><i class="ti-trash"></i> Trash Note</span>
		<span ng-show="currentNote.folder == 'trash'" ng-click="trashNote(currentNote.id,true,true,false)" class="cool-button delete pull-right"><i class="ti-trash"></i> Delete Note</span>
	</div>
	 <input name="image" type="file" id="upload" class="hidden"  onchange="angular.element(this).scope().uploadImage(this.files)">
</div>