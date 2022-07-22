"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList.stories);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();

  //if current user fav stories includes story id of story
  //use filled star
  //if not, use unfilled star

  const star = currentUser.favorites.some(
    favorite => favorite.storyId === story.storyId) ?
    "bi-star-fill" : "bi-star";

  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="bi ${star}"></i>
        <span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Takes input list of stories, generates their HTML, and puts on page. */

function putStoriesOnPage(list) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through our list of stories and generate HTML for them
  for (let story of list) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Posts a new story to server, and updates storyList */
async function submitNewStory(evt) {
  evt.preventDefault();
  console.debug("submitNewStory submmited");
  const submission = {
    author: $("#author").val(),
    title: $("#title").val(),
    url: $("#url").val()
  };

  const story = await storyList.addStory(currentUser, submission);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $("#submit-form").hide();
}

$("#submit-form").on("submit", submitNewStory);


/** Lets user favorite/unfavorite a story */
async function toggleFavorite(evt) {
  //listen to click on star
  //if star is filled, remove favorite
  //remove current class, add new empty star class
  //if star is empy, add favorite
  //remove current class, add new filled star class

  const $star = $(evt.target);
  const storyId = $star.closest("li").attr("id");
  console.log(storyId, typeof storyId);
  const targetStory = await Story.getStoryById(storyId);

  $star.toggleClass("bi-star bi-star-fill");

  if ($star.hasClass("bi-star-fill")) {
    //add story to user favorites list
    currentUser.addFavorite(targetStory);
  } else {
    currentUser.removeFavorite(targetStory);
  }
}

$allStoriesList.on("click", "span", toggleFavorite);

