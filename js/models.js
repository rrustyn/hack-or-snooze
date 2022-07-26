"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** takes in a story ID, returns a story object from server story list */
  static async getStoryById (id) {
    let response = await axios({
      url: `${BASE_URL}/stories/${id}`,
      method: "GET",
    });

    return new Story(response.data.story);
  }


  /** Parses hostname out of URL and returns it. */

  getHostName() {
    //input: a valid url
    //find the end of the protocol :// and start of resourse /
    //use pointers to find end of // and next / (or end of string)
    //take string inbetween

    //https://site.com/
    //        l
    //        r

    //look up url class on MDN

    const url = new URL(this.url);
    return url.hostname;


    // A complicated way to find a hostname
    //
    // let left = 0;
    // let right = 1;
    // for (let i = 0; i < this.url.length; i++) {
    //   if (this.url[left] === '/' && this.url[right] === '/' && (right - left) === 1) {
    //     left++;
    //     right++;
    //   } else if (this.url[left] === '/' && this.url[right] === '/' || right === this.url.length) {
    //     left++;
    //     return this.url.slice(left, right);
    //   } else if (this.url[left] === '/') {
    //     right++;
    //   } else {
    //     left++;
    //     right++;
    //   }
    // }
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?
    //
    //  It's like a dynamic constructor for the storyList instance we want to
    //  create. We want an object with stories, not an object that will get stories

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    //   return await axios({
    //     method: 'post',
    //     url: `${BASE_URL}/stories`,
    //     data: {
    //       token: user.loginToken,
    //       story: {
    //         author: newStory.author,
    //         title: newStory.title,
    //         url: newStory.url
    //       }
    //     }
    // });

    let response = await axios.post(`${BASE_URL}/stories`,
      {
        token: user.loginToken,
        story: {
          author: newStory.author,
          title: newStory.title,
          url: newStory.url
        }
      });

    let addStory = new Story(response.data.story);
    this.stories.unshift(addStory);
    return addStory;
  }

}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Adds a story to user favorites */
  async addFavorite(story) {
    //input: a story
    //put story in user favorites array, in the front
    //call API to add story to favorites server user profile


    this.favorites.unshift(story);

    const response = await axios.post(
      `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      {
        token: this.loginToken
      });


    console.debug("The server responded:", response);
  }

  /** Removes a story to user favorites */
  async removeFavorite(story) {
    //input: story
    //remove the story from the array of user stories
    // - take the storyId, find location in favorites array (indexOf?)
    //    cut from array


    //delete the favorite from db favorites
    // -its just adding favorites but delete instead of post

    const storyIndex = (
      this.favorites.findIndex(favorite => favorite.storyId === story.storyId)
    );
    this.favorites.splice(storyIndex, 1);
    console.debug("your token:", this.loginToken);
    const response = await axios(
      {
        url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
        method: 'DELETE',
        data:
        {
          token: this.loginToken
        }
      });

    console.debug("The server responded:", response);
  }
}
