"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** */

function navFavoritesClick(evt) {
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage(currentUser.favorites);
}

$("#nav-favorites").on("click", navFavoritesClick);

/** Show submit form when click submit */
function navSubmitClick(evt) {
  evt.preventDefault();
  $("#submit-form").show();
}

$("#nav-submit").on("click", navSubmitClick);

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage(storyList.stories);
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
