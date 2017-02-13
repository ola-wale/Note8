<div class="animated fadeIn notes-view m15">
	<note-item ng-class="{'selected':(selectedNotesArr.indexOf(n.id) > -1)}" style="background-color:{{n.color}}" id="note-{{n.id}}" ng-init="$last && reEnforceNotes()" data-note-id="{{n.id}}" ng-repeat="n in notes">
		<ul id="palette-chooser-{{n.id}}" class="color-palette">
			<li ng-click="handleNoteColorChange(n.id,c,$event)" data-palette-color={{c}} ng-class="{'active-color':c==n.color}" ng-repeat="c in allowedNoteColors" style="background-color:{{c}}"></li>
		</ul>
		<a href="notes/view/{{n.id}}" class="no-interact"></a>
		<h6 class="ttl"><b>{{n.title}}</b></h6>
		<content class="notranslate" ng-bind-html="n.content | safe"></content>
		<div class="hover-component">
			<ul class="clearfix">
				<li ng-click="selectNote(n.id)"  id="selectNote-{{n.id}}" class="action select"><span class="ti-check selectNote"></span></li>
				<li class="mdl-tooltip" data-mdl-for="selectNote-{{n.id}}">Select</li>
				<li ng-show="n.folder != 'trash'" ng-click="trashNote(n.id)" id="trashNote{{n.id}}" class="ti-trash action"></li>
				<li ng-show="n.folder != 'trash'" class="mdl-tooltip" data-mdl-for="trashNote{{n.id}}">Move to Trash</li>
				<li ng-show="n.folder == 'trash'" ng-click="trashNote(n.id,true,true,false)" id="ctrashNote{{n.id}}" class="ti-trash action"></li>
				<li ng-show="n.folder == 'trash'" class="mdl-tooltip" data-mdl-for="ctrashNote{{n.id}}">Delete</li>
				<li ng-click="nToggleClass('#palette-chooser-'+n.id,'bring')" id="palette{{n.id}}" class="ti-palette action"></li>
				<li class="mdl-tooltip" data-mdl-for="palette{{n.id}}">Change Color</li>
				<li ng-click="duplicate(n.id)" id="duplicate-{{n.id}}" class="ti-files action"></li>
				<li class="mdl-tooltip" data-mdl-for="duplicate-{{n.id}}">Make Copy</li>
				<li ng-show="n.folder == 'trash'" ng-click="restore(n.id)" id="restore-{{n.id}}" class="ti-export action"></li>
				<li ng-show="n.folder == 'trash'" class="mdl-tooltip" data-mdl-for="restore-{{n.id}}">Restore</li>
			</ul>
		</div>
	</note-item>
</div>

<div ng-show="!notes" class="no-notes">
	<i class="ti-notepad"></i>
	<small>No matching results.</small>
</div>