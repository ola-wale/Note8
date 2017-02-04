<div class="searchby col-lg-offset-1 col-md-10">
	<div ng-show="userTags != ''" class="by-tags by animated slideInUp">
		<h5>Tags</h5>
		<ul>
			<li ng-show="tag != ''" class="target" ng-repeat="tag in userTags">
				<a href="notes/tag/{{tag}}">
					<div class="vmiddle">
						<i class="ti-tag"></i>{{tag}}
					</div>
				</a>
			</li>
		</ul>
	</div>
	<div ng-show="userColors != ''" class="by-colors by animated slideInUp">
		<h5>Colors</h5>
		<ul>
			<li class="target" ng-repeat="color in userColors">
				<a href="notes/color/{{color}}">
					<div class="vmiddle">
						<span style="background-color:#{{color}};" class="by-color"></span>
					</div>
				</a>
			</li>
		</ul>
	</div>
</div>