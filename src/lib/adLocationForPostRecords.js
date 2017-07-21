import { AD_LOCATION } from 'app/constants';

export default function(postRecords=[]) {
  return Math.min(AD_LOCATION, postRecords.length);
}

const canShowAdNextTo = post => !post.over18 && post.brandSafe;

export const dfpAdLocationFromPosts = (posts = []) => {
  let location = null;
  for (let i = AD_LOCATION; i < posts.length; i++) {
    const currentPost = posts[i];
    const nextPost = posts[i+1];
    if (canShowAdNextTo(currentPost) && (!nextPost || canShowAdNextTo(nextPost))) {
      location = i;
      break;
    }
  }
  return location;
};
