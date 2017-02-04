<div ng-controller="settingsController" class="animated fadeIn settings-view m15 col-sm-8 col-sm-offset-2">
	<div class="user-img">
		<img ng-click="trigger('#form-user-image','click');" ng-if="user.image" ng-src="{{user.image}}" />
		<img ng-click="trigger('#form-user-image','click');" ng-if="!user.image" ng-src="{{base}}images/nophoto_user.png" />
		<div class="img-hover-component">

		</div>
	</div>
	<form ng-submit="saveSettings(settingsForm);" name="settingsForm">
		<input id="form-user-image" hidden name="user-image" type="file" fileread="user.image" />
		<label for="settings-name">First Name</label>
		<input required ng-minlength="1" ng-maxlength="20" ng-model="user.firstname" ng-pattern="/^\s*\S+(?:\s+\S+){0}\s*$/" name="firstname" id="settings-name"  />
		<div ng-messages="settingsForm.firstname.$error" style="color:red" role="alert">
			<div ng-message="pattern">No Spaces Allowed</div>
			<div ng-message="minlength">Enter at least one character</div>
			<div ng-message="maxlength">Enter a maximum of 20 characters</div>
		</div>
		<label for="settings-lastname">Last Name</label>
		<input required ng-minlength="1" ng-maxlength="20" ng-model="user.lastname" ng-pattern="/^\s*\S+(?:\s+\S+){0}\s*$/" name="lastname" id="settings-lastname"  />
		<div ng-messages="settingsForm.lastname.$error" style="color:red" role="alert">
			<div ng-message="pattern">No Spaces Allowed</div>
			<div ng-message="minlength">Enter at least one character</div>
			<div ng-message="maxlength">Enter a maximum of 20 characters</div>
		</div>
		<label for="settings-oldpassword">Old Password</label>
		<input type="password" ng-minlength="6" ng-model="user.oldpassword" name="oldpassword" id="settings-oldpassword"  />
		<div ng-messages="settingsForm.oldpassword.$error" style="color:red" role="alert">
			<div ng-message="minlength">Passwords must be six characters or more</div>
		</div>
		<label for="settings-newpassword">New Password</label>
		<input type="text" ng-minlength="6" ng-model="user.newpassword" name="newpassword" id="settings-newpassword"  />
		<div ng-messages="settingsForm.newpassword.$error" style="color:red" role="alert">
			<div ng-message="minlength">Passwords must be six characters or more</div>
		</div>
		<label for="settings-confirmnewpassword">Confirm New Password</label>
		<input ng-keyup="check()" type="text" ng-minlength="6" ng-model="user.confirmnewpassword" name="confirmnewpassword" id="settings-confirmnewpassword"  />
		<div ng-messages="settingsForm.confirmnewpassword.$error" style="color:red" role="alert">
			<div ng-message="correct">Passwords do not match</div>
		</div>
		<input ng-disabled="settingsForm.$invalid" type="submit" value="Save" class="blue" />
	</form>
</div>